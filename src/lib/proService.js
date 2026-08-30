import { supabase } from "./supabase";

/**
 * PRO Status va Admin Tasdiqlash (Admin Approval) xizmatlari.
 * Supabase `profiles` va `pro_requests` jadvallari bilan ishlaydi.
 */

/**
 * 1. Yangi PRO sotib olish so'rovini yaratish
 * @param {Object} params
 * @param {string} params.userId - Foydalanuvchi ID si (UUID/Text)
 * @param {string} params.telegramUsername - Foydalanuvchining Telegram username'i (masalan: @username)
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export async function createProRequest({ userId, telegramUsername }) {
  try {
    if (!userId) {
      throw new Error("Foydalanuvchi ID-si ko'rsatilmadi.");
    }

    // Tekshirish: foydalanuvchida kutilayotgan so'rov bormi?
    const { data: existingRequest, error: checkError } = await supabase
      .from("pro_requests")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "pending")
      .maybeSingle();

    if (checkError) {
      console.warn("So'rovni tekshirishda ogohlantirish:", checkError.message);
    }

    if (existingRequest) {
      return {
        success: true,
        data: existingRequest,
        message: "Sizda allaqachon kutilayotgan so'rov mavjud.",
      };
    }

    // Yangi so'rov kiratish
    const { data, error } = await supabase
      .from("pro_requests")
      .insert([
        {
          user_id: userId,
          telegram_username: telegramUsername || "",
          status: "pending",
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      success: true,
      data,
      message: "PRO so'rovi muvaffaqiyatli yuborildi!",
    };
  } catch (error) {
    console.error("createProRequest xatosi:", error);
    return {
      success: false,
      error: error.message || "PRO so'rovini yuborishda xatolik yuz berdi.",
    };
  }
}

/**
 * 2. Foydalanuvchining PRO statusi va kutilayotgan so'rovlarini olish
 * @param {string} userId - Foydalanuvchi ID si
 * @returns {Promise<{success: boolean, profile?: any, pendingRequest?: any, error?: string}>}
 */
export async function getUserProStatus(userId) {
  try {
    if (!userId) return { success: false, error: "User ID kerak" };

    // Profiles jadvalidan statusni olish
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, full_name, avatar_url, banner_url, is_pro, pro_expires_at")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) {
      throw profileError;
    }

    // Kutilayotgan so'rovni olish
    const { data: pendingRequest } = await supabase
      .from("pro_requests")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return {
      success: true,
      profile: profile || { id: userId, is_pro: false, pro_expires_at: null },
      pendingRequest: pendingRequest || null,
    };
  } catch (error) {
    console.error("getUserProStatus xatosi:", error);
    return {
      success: false,
      error: error.message || "PRO statusini yuklashda xatolik.",
    };
  }
}

/**
 * 3. Kutilayotgan (pending) barcha PRO so'rovlarni Admin uchun olish
 * @returns {Promise<{success: boolean, data?: Array<any>, error?: string}>}
 */
export async function getPendingProRequests() {
  try {
    // pro_requests jadvalidan 'pending' statusidagi so'rovlarni profiles bilam birga olish
    const { data, error } = await supabase
      .from("pro_requests")
      .select(`
        id,
        user_id,
        telegram_username,
        status,
        created_at,
        profiles:user_id (
          email,
          full_name,
          avatar_url
        )
      `)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    console.error("getPendingProRequests xatosi:", error);
    return {
      success: false,
      data: [],
      error: error.message || "So'rovlarni olishda xatolik yuz berdi.",
    };
  }
}

/**
 * 4. Admin Tomonidan Tasdiqlash Funksiyasi (Approve Logic)
 * - `pro_requests` jadvalidagi status `approved` ga o'zgaradi.
 * - `profiles` jadvalida userning `is_pro` qiymati `true` qilinadi va `pro_expires_at` +30 kun qilib belgilanadi.
 * 
 * @param {Object} params
 * @param {string|number} params.requestId - `pro_requests` jadvalidagi ID
 * @param {string|number} params.userId - Foydalanuvchi ID si
 * @param {number} [params.durationDays=30] - PRO muddati (kunlarda, default: 30)
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export async function approveProRequest({ requestId, userId, durationDays = 30 }) {
  try {
    if (!requestId || !userId) {
      throw new Error("Tasdiqlash uchun Request ID va User ID talab qilinadi.");
    }

    // 30 kunlik muddatni hisoblash (Joriy vaqtdan +30 kun)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);
    const proExpiresAtIso = expiresAt.toISOString();

    // Step A: `pro_requests` statusini 'approved' ga yangilash
    const { error: requestUpdateError } = await supabase
      .from("pro_requests")
      .update({
        status: "approved",
      })
      .eq("id", requestId);

    if (requestUpdateError) {
      throw new Error(`So'rov statusini yangilashda xatolik: ${requestUpdateError.message}`);
    }

    // Step B: `profiles` jadvalida userning `is_pro` qiymatini true va `pro_expires_at` o'rnatish
    const { error: profileUpdateError } = await supabase
      .from("profiles")
      .update({
        is_pro: true,
        pro_expires_at: proExpiresAtIso,
      })
      .eq("id", userId);

    if (profileUpdateError) {
      // Agar 'profiles' topilmasa yoki xatolik bo'lsa, 'ustalar' jadvalini ham zaxira sifatida yangilaymiz
      const { error: fallbackError } = await supabase
        .from("ustalar")
        .update({
          is_pro: true,
          pro_expires_at: proExpiresAtIso,
        })
        .eq("id", userId);

      if (fallbackError) {
        throw new Error(`Profil statusini PRO ga o'tkazishda xatolik: ${profileUpdateError.message}`);
      }
    }

    return {
      success: true,
      message: `Foydalanuvchi (ID: ${userId}) muvaffaqiyatli PRO statusiga o'tkazildi (+${durationDays} kun)!`,
    };
  } catch (error) {
    console.error("approveProRequest try/catch xatosi:", error);
    return {
      success: false,
      error: error.message || "Tasdiqlash jarayonida kutilmagan xatolik yuz berdi.",
    };
  }
}

/**
 * 5. Admin Tomonidan So'rovni Rad Etish (Reject Logic)
 * @param {Object} params
 * @param {string|number} params.requestId - `pro_requests` jadvalidagi ID
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export async function rejectProRequest({ requestId }) {
  try {
    if (!requestId) {
      throw new Error("Rad etish uchun Request ID ko'rsatilmadi.");
    }

    const { error } = await supabase
      .from("pro_requests")
      .update({
        status: "rejected",
      })
      .eq("id", requestId);

    if (error) throw error;

    return {
      success: true,
      message: "So'rov rad etildi.",
    };
  } catch (error) {
    console.error("rejectProRequest xatosi:", error);
    return {
      success: false,
      error: error.message || "So'rovni rad etishda xatolik yuz berdi.",
    };
  }
}

/**
 * 6. Realtime Tinglovchisi: User profili o'zgarganda bildirishnoma (Supabase Realtime)
 * Foydalanuvchi sahifani yangilamasdan (F5 bosmasdan) darhol PRO rejimiga o'tishi uchun.
 * 
 * @param {string} userId - Tinglanayotgan user ID
 * @param {Function} onUpdateCallback - Profil yangilanganda chaqiriluvchi callback
 * @returns {Function} Unsubscribe funksiyasi
 */
export function subscribeToProStatus(userId, onUpdateCallback) {
  if (!userId) return () => {};

  const channelName = `realtime-pro-status-${userId}`;

  const channel = supabase
    .channel(channelName)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "profiles",
        filter: `id=eq.${userId}`,
      },
      (payload) => {
        console.log("⚡ Supabase Realtime: Profile PRO statusi yangilandi:", payload.new);
        if (typeof onUpdateCallback === "function") {
          onUpdateCallback(payload.new);
        }
      }
    )

  channel.subscribe();

  // Clean-up funksiyasi
  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * 7. Realtime Tinglovchisi: Admin uchun yangi kelayotgan so'rovlarni tinglash
 * @param {Function} onRequestsChange - So'rovlar o'zgarganda chaqiriluvchi callback
 * @returns {Function} Unsubscribe funksiyasi
 */
export function subscribeToPendingRequests(onRequestsChange) {
  const channel = supabase
    .channel("admin-pro-requests-realtime")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "pro_requests",
      },
      () => {
        console.log("⚡ Supabase Realtime: pro_requests jadvalida o'zgarish bo'ldi!");
        if (typeof onRequestsChange === "function") {
          onRequestsChange();
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * 8. PRO Obuna muddati tugagan bo'lsa avtomatik Free tarifga tushirish (Downgrade)
 * @param {Object} master - Usta obyekti
 * @returns {Promise<any>} Yangilangan usta obyekti
 */
export async function downgradeMasterIfExpired(master) {
  if (!master || !master.is_pro || !master.pro_expires_at) return master;

  const expStr = String(master.pro_expires_at || '');

  // Umrbod (lifetime) obunalar muddati tugamaydi (2099 bilan boshlanadi)
  if (expStr.startsWith('2099')) {
    return master;
  }

  const now = new Date();
  const expiresAt = new Date(master.pro_expires_at);
  if (now > expiresAt) {
    console.log(`⚠️ Usta ID ${master.id} PRO obuna muddati tugagan. Downgrade bajarilmoqda...`);
    const downgradedData = await executeDowngrade(master.id, master.portfolio);
    return { ...master, ...downgradedData };
  }

  return master;
}

/**
 * 9. Ustanining PRO maqomini bekor qilish va Free tarifga o'tkazish (Revoke PRO & Downgrade)
 * @param {string|number} masterId - Usta ID si
 * @param {Array} currentPortfolio - Joriy portfolio rasmlari massivi
 * @returns {Promise<Object>} Yangilangan ma'lumotlar
 */
export async function executeDowngrade(masterId, currentPortfolio = []) {
  if (!masterId) return null;

  let portfolioList = [];
  if (Array.isArray(currentPortfolio)) {
    portfolioList = currentPortfolio;
  } else if (typeof currentPortfolio === 'string') {
    try {
      portfolioList = JSON.parse(currentPortfolio || '[]');
    } catch (e) {
      portfolioList = [];
    }
  }

  // Portfolio rasmlarini xavfsiz qisqartirish (max 5 ta saqlanadi)
  const trimmedPortfolio = portfolioList.slice(0, 5);

  const downgradePayload = {
    is_pro: false,
    is_verified: false,
    pro_plan: null,
    pro_expires_at: null,
    max_portfolio: 5,
    banner_customization: false,
    banner_color: null,
    banner_url: null,
    portfolio: trimmedPortfolio,
    show_congrats_modal: false,
    pro_modal_shown: false
  };

  try {
    await supabase.from("ustalar").update(downgradePayload).eq("id", masterId);
  } catch (e) {
    console.error("Error updating ustalar table on downgrade:", e);
  }

  try {
    await supabase.from("profiles").update(downgradePayload).eq("id", masterId);
  } catch (e) {
    console.error("Error updating profiles table on downgrade:", e);
  }

  try {
    await supabase.from("users").update(downgradePayload).eq("id", masterId);
  } catch (e) {
    console.error("Error updating users table on downgrade:", e);
  }

  // LocalStorage'dagi ma'lumotni ham yangilash
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("usta_current_master");
    if (stored) {
      try {
        const localMaster = JSON.parse(stored);
        if (String(localMaster.id) === String(masterId)) {
          const updatedLocal = { ...localMaster, ...downgradePayload };
          localStorage.setItem("usta_current_master", JSON.stringify(updatedLocal));
          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(new Event("auth_changed"));
        }
      } catch (e) {}
    }
  }

  return downgradePayload;
}
