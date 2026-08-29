"use client";

import React, { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  Sparkles, 
  Send, 
  ShieldCheck, 
  Clock, 
  Zap, 
  Image as ImageIcon, 
  TrendingUp, 
  Bot, 
  BadgeCheck,
  Check,
  AlertCircle
} from "lucide-react";
import { 
  getUserProStatus, 
  createProRequest, 
  subscribeToProStatus 
} from "@/lib/proService";

// Admin Telegram username (Atrofdagi muhit o'zgaruvchisidan yoki default administratordan olinadi)
const ADMIN_TELEGRAM_USERNAME = process.env.NEXT_PUBLIC_ADMIN_TELEGRAM || "admin_username";

export default function ProPricingCard({ user, onProStatusUpdate }) {
  const userId = user?.id || null;
  const userEmail = user?.email || user?.phone || "Noma'lum";
  const userName = user?.full_name || user?.name || "Foydalanuvchi";

  const [isPro, setIsPro] = useState(user?.is_pro || false);
  const [proExpiresAt, setProExpiresAt] = useState(user?.pro_expires_at || null);
  const [pendingRequest, setPendingRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [telegramInput, setTelegramInput] = useState("");
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Status va kutilayotgan so'rovlarni yuklash
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function loadStatus() {
      setLoading(true);
      const res = await getUserProStatus(userId);
      if (isMounted && res.success) {
        if (res.profile) {
          setIsPro(!!res.profile.is_pro);
          setProExpiresAt(res.profile.pro_expires_at);
        }
        setPendingRequest(res.pendingRequest);
      }
      if (isMounted) setLoading(false);
    }

    loadStatus();

    // ⚡ REALTIME TINGLOVCHI: Supabase Realtime orqali profil o'zgarganda darhol PRO rejimiga o'tadi (F5 shart emas!)
    const unsubscribe = subscribeToProStatus(userId, (updatedProfile) => {
      console.log("⚡ Realtime notification activated in ProPricingCard:", updatedProfile);
      if (updatedProfile.is_pro !== undefined) {
        setIsPro(!!updatedProfile.is_pro);
        setProExpiresAt(updatedProfile.pro_expires_at);
        setPendingRequest(null); // PRO bo'lganligi sababli kutilayotgan so'rov yopiladi
        setStatusMessage({
          type: "success",
          text: "Tabriklaymiz! Sizning profilingiz PRO statusiga faollashtirildi! 🎉",
        });

        if (typeof onProStatusUpdate === "function") {
          onProStatusUpdate(updatedProfile);
        }
      }
    });

    return () => {
      isMounted = false;
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [userId, onProStatusUpdate]);

  // "Telegram orqali faollashtirish" bosilganda so'rov yuborish va Telegramga yo'naltirish
  const handleTelegramActivationClick = () => {
    if (!userId) {
      setStatusMessage({
        type: "error",
        text: "Iltimos, avval tizimga kiring!",
      });
      return;
    }
    setShowTelegramModal(true);
  };

  const handleConfirmTelegramSubmit = async (e) => {
    e.preventDefault();
    if (!userId) return;

    setSubmitting(true);
    setStatusMessage(null);

    const cleanUsername = telegramInput.replace("@", "").trim();

    try {
      // 1. Supabase `pro_requests` jadvaliga yozish
      const reqResult = await createProRequest({
        userId,
        telegramUsername: cleanUsername ? `@${cleanUsername}` : "",
      });

      if (reqResult.success) {
        setPendingRequest(reqResult.data);

        // 2. Telegram xabarini tayyorlash
        const textMessage = `Salom Admin! Men PRO tarifini faollashtirmoqchiman.%0A%0A👤 *Foydalanuvchi:* ${encodeURIComponent(
          userName
        )}%0A📧 *Email/Aloqa:* ${encodeURIComponent(
          userEmail
        )}%0A🆔 *User ID:* ${userId}%0A📱 *Telegram:* @${cleanUsername || "ko'rsatilmadi"}`;

        const telegramUrl = `https://t.me/${ADMIN_TELEGRAM_USERNAME}?text=${textMessage}`;

        setShowTelegramModal(false);
        setStatusMessage({
          type: "success",
          text: "So'rov yuborildi! Siz Admin Telegram profiliga yo'naltirilasiz.",
        });

        // 3. Telegram ilovasi/saytiga o'tkazish
        window.open(telegramUrl, "_blank");
      } else {
        setStatusMessage({
          type: "error",
          text: reqResult.error || "So'rov yuborishda xatolik yuz berdi.",
        });
      }
    } catch (err) {
      console.error("Activation error:", err);
      setStatusMessage({
        type: "error",
        text: "Kutilmagan xatolik: " + (err.message || err),
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Sana formatlash
  const formattedExpiryDate = proExpiresAt
    ? new Date(proExpiresAt).toLocaleDateString("uz-UZ", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="w-full max-w-md mx-auto relative group">
      {/* Visual Ambient Glow background */}
      <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition duration-500" />

      {/* Main Pricing Card */}
      <div className="relative bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-white overflow-hidden backdrop-blur-xl">
        
        {/* Top Badge */}
        <div className="flex items-center justify-between mb-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PREMIUM IMKONIYATLAR</span>
          </div>

          {isPro ? (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold animate-pulse">
              <BadgeCheck className="w-4 h-4" />
              <span>PRO FAOL</span>
            </span>
          ) : pendingRequest ? (
            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-500/30 text-sky-400 text-xs font-medium">
              <Clock className="w-3.5 h-3.5 animate-spin" />
              <span>KUTILMOQDA</span>
            </span>
          ) : null}
        </div>

        {/* Title & Description */}
        <div className="space-y-2 mb-6">
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            PRO Status
            <span className="text-amber-400">.</span>
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Biznesingizni va xizmatlaringizni keyingi bosqichga olib chiqing hamda ko'proq mijozlarga ega bo'ling.
          </p>
        </div>

        {/* Status Message Alert */}
        {statusMessage && (
          <div
            className={`mb-6 p-4 rounded-2xl flex items-start space-x-3 text-sm border ${
              statusMessage.type === "success"
                ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                : "bg-rose-950/60 border-rose-500/40 text-rose-300"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Active Pro Status Banner */}
        {isPro && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 border border-amber-500/40 space-y-1">
            <p className="text-sm font-semibold text-amber-300 flex items-center gap-1.5">
              <BadgeCheck className="w-4 h-4 text-amber-400" />
              PRO statusingiz faollashtirilgan!
            </p>
            {formattedExpiryDate && (
              <p className="text-xs text-slate-300">
                Amal qilish muddati: <span className="font-semibold text-white">{formattedExpiryDate}</span> gacha
              </p>
            )}
          </div>
        )}

        {/* Feature List (Talab 3: PRO Afzalliklari) */}
        <div className="space-y-4 mb-8">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            PRO Tarifi Afzalliklari:
          </p>

          <ul className="space-y-3.5 text-sm">
            <li className="flex items-start space-x-3">
              <div className="p-1 rounded-lg bg-sky-500/20 text-sky-400 mt-0.5 border border-sky-500/30 shrink-0">
                <BadgeCheck className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <span className="font-semibold text-slate-100 flex items-center gap-1.5">
                  Moviy Tasdiqlangan Galochka 🌟
                </span>
                <p className="text-xs text-slate-400">
                  Ismingiz yonida rasmiy ishonch belgisi va VIP ko'rinish
                </p>
              </div>
            </li>

            <li className="flex items-start space-x-3">
              <div className="p-1 rounded-lg bg-purple-500/20 text-purple-400 mt-0.5 border border-purple-500/30 shrink-0">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <span className="font-semibold text-slate-100 flex items-center gap-1.5">
                  Maxsus Bannerlar 🎨
                </span>
                <p className="text-xs text-slate-400">
                  Profil tepasiga o'z brendingiz bannerini o'rnatish imkoniyati
                </p>
              </div>
            </li>

            <li className="flex items-start space-x-3">
              <div className="p-1 rounded-lg bg-amber-500/20 text-amber-400 mt-0.5 border border-amber-500/30 shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <span className="font-semibold text-slate-100 flex items-center gap-1.5">
                  TOP Qatorlarda Chiqish 🚀
                </span>
                <p className="text-xs text-slate-400">
                  Qidiruv va katalogda birinchi bo'lib ko'rinish va 5x ko'proq buyurtmalar
                </p>
              </div>
            </li>

            <li className="flex items-start space-x-3">
              <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400 mt-0.5 border border-emerald-500/30 shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <span className="font-semibold text-slate-100 flex items-center gap-1.5">
                  AI Yordamchi 🤖
                </span>
                <p className="text-xs text-slate-400">
                  Sun'iy intellekt orqali tavsif va e'lon matnlarini avtomatik yozish
                </p>
              </div>
            </li>
          </ul>
        </div>

        {/* Action Button Section */}
        {isPro ? (
          <div className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-center font-bold text-sm flex items-center justify-center space-x-2">
            <Check className="w-5 h-5" />
            <span>PRO statusingiz faol!</span>
          </div>
        ) : pendingRequest ? (
          <div className="space-y-3">
            <div className="w-full py-3.5 px-4 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-300 text-center text-sm font-semibold flex items-center justify-center space-x-2">
              <Clock className="w-4 h-4 text-sky-400 animate-spin" />
              <span>Admin tasdiqlashi kutilmoqda...</span>
            </div>
            <p className="text-xs text-center text-slate-400">
              Admin to'lov va ma'lumotlarni tekshirib tasdiqlashi bilan profilingiz avtomatik PRO bo'ladi.
            </p>
          </div>
        ) : (
          <button
            onClick={handleTelegramActivationClick}
            disabled={loading}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-base shadow-xl shadow-amber-500/25 transition-all transform active:scale-95 flex items-center justify-center space-x-2 border border-amber-300/40 cursor-pointer"
          >
            <Send className="w-5 h-5 fill-slate-950" />
            <span>Telegram orqali faollashtirish</span>
          </button>
        )}
      </div>

      {/* Telegram User Input Modal */}
      {showTelegramModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-5 shadow-2xl relative">
            <div className="space-y-2 text-center">
              <div className="w-12 h-12 bg-sky-500/20 text-sky-400 rounded-2xl mx-auto flex items-center justify-center border border-sky-500/30">
                <Send className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-white">Telegram Nickname</h4>
              <p className="text-xs text-slate-400">
                Admin siz bilan bog'lanishi uchun Telegram username'ingizni kiriting
              </p>
            </div>

            <form onSubmit={handleConfirmTelegramSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Telegram Username (ixtiyoriy)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-slate-500 text-sm font-semibold">
                    @
                  </span>
                  <input
                    type="text"
                    value={telegramInput}
                    onChange={(e) => setTelegramInput(e.target.value)}
                    placeholder="username"
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl text-white text-sm outline-none transition"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTelegramModal(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition flex items-center justify-center space-x-1"
                >
                  {submitting ? (
                    <Clock className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Davom etish</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
