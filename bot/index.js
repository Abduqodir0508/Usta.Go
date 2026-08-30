require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });
const { Telegraf, Markup } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');

// Konfiguratsiya
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8845833064:AAHB1nASi0Cwq8rZUQhvor008OX6dtQA4as';
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || '2067464475';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qmslmdtccekopxmgjkse.supabase.com';

// Service Role Key support for RLS bypass (if present in env)
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_1iSPG6Kz2mC5T1SKG8vkEw_sIa1ssBW';

const bot = new Telegraf(BOT_TOKEN);
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false }
});

if (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY) {
  console.log('[Supabase Client] Service Role Key is active. RLS bypassed for admin bot backend.');
} else {
  console.log('[Supabase Client] Public Anon Key is active.');
}

// Foydalanuvchi holatlari (In-Memory)
const userSessions = new Map();

// Tarif narxlari va nomlari
const PLAN_DETAILS = {
  '1m': { label: '1 Oylik PRO', amount: '1 000' },
  '3m': { label: '3 Oylik PRO (+1 oy bonus)', amount: '1 000' },
  '6m': { label: '6 Oylik PRO (+2 oy bonus)', amount: '1 000' },
  'life': { label: 'Umrbod PRO (Lifetime)', amount: '1 000' },
  '1_oylik': { label: '1 Oylik PRO', amount: '1 000' },
  '3_oylik': { label: '3 Oylik PRO (+1 oy bonus)', amount: '1 000' },
  '6_oylik': { label: '6 Oylik PRO (+2 oy bonus)', amount: '1 000' },
  'lifetime': { label: 'Umrbod PRO (Lifetime)', amount: '1 000' },
  '1_month': { label: '1 Oylik PRO', amount: '1 000' },
  '3_months': { label: '3 Oylik PRO (+1 oy bonus)', amount: '1 000' },
  '6_months': { label: '6 Oylik PRO (+2 oy bonus)', amount: '1 000' }
};

// Matnlar (3 tilda)
const texts = {
  uz: {
    welcome: "👋 Assalomu alaykum! UstaGo PRO rasmiy to'lov botiga xush kelibsiz.\n\nQuyidagi tariflardan birini tanlang:\n\n👨‍💻 Admin / Bog'lanish: @A_Husanboyev",
    plans: {
      '1m': '1 Oylik PRO (1 000 UZS)',
      '3m': '3 Oylik PRO (+1 oy bonus) (1 000 UZS)',
      '6m': '6 Oylik PRO (+2 oy bonus) (1 000 UZS)',
      'life': '👑 Umrbod PRO (1 000 UZS)'
    },
    payment_info: (planLabel, amount) => `📦 <b>Tanlangan tarif:</b> ${planLabel}
💰 <b>To'lov summasi:</b> ${amount} UZS
💳 <b>Karta raqam:</b> <code>5614 6887 1438 0671</code> (M.S)

ℹ️ <b>To'lov usullari:</b>
To'lovni <b>Click</b>, <b>Payme</b>, <b>Uzum Bank</b> yoki boshqa ilovalar orqali o'tkazishingiz mumkin.

⚠️ <b>DIQQAT:</b>
To'lovni amalga oshirgach, to'lov chekining rasmini (skrinshotini) shu yerga yuboring 📸.
Chekni yuborgach <b>5-10 daqiqa</b> kuting, adminlarimiz tekshirib PRO maqomingizni tasdiqlaydi.

👨‍💻 <b>Admin / Bog'lanish:</b> @A_Husanboyev`
  },
  ru: {
    welcome: "👋 Здравствуйте! Добро пожаловать в официальный платежный бот UstaGo PRO.\n\nВыберите тариф:\n\n👨‍💻 Админ / Связь: @A_Husanboyev",
    plans: {
      '1m': '1 Месяц PRO (1 000 UZS)',
      '3m': '3 Месяца PRO (+1 мес бонус) (1 000 UZS)',
      '6m': '6 Месяцев PRO (+2 мес бонус) (1 000 UZS)',
      'life': '👑 Пожизненный PRO (1 000 UZS)'
    },
    payment_info: (planLabel, amount) => `📦 <b>Выбранный тариф:</b> ${planLabel}
💰 <b>Сумма к оплате:</b> ${amount} UZS
💳 <b>Номер карты:</b> <code>5614 6887 1438 0671</code> (M.S)

ℹ️ <b>Способы оплаты:</b>
Вы можете оплатить через <b>Click</b>, <b>Payme</b>, <b>Uzum Bank</b> или другие банковские приложения.

⚠️ <b>ВНИМАНИЕ:</b>
После оплаты отправьте скриншот чека прямо в этот бот 📸.
Подождите <b>5-10 минут</b>, наши администраторы проверят и подтвердят ваш PRO статус.

👨‍💻 <b>Админ / Связь:</b> @A_Husanboyev`
  },
  en: {
    welcome: "👋 Hello! Welcome to UstaGo PRO official payment bot.\n\nChoose a plan:\n\n👨‍💻 Admin / Contact: @A_Husanboyev",
    plans: {
      '1m': '1 Month PRO (1 000 UZS)',
      '3m': '3 Months PRO (+1 mo bonus) (1 000 UZS)',
      '6m': '6 Months PRO (+2 mo bonus) (1 000 UZS)',
      'life': '👑 Lifetime PRO (1 000 UZS)'
    },
    payment_info: (planLabel, amount) => `📦 <b>Selected plan:</b> ${planLabel}
💰 <b>Payment amount:</b> ${amount} UZS
💳 <b>Card number:</b> <code>5614 6887 1438 0671</code> (M.S)

ℹ️ <b>Payment methods:</b>
You can pay via <b>Click</b>, <b>Payme</b>, <b>Uzum Bank</b> or other payment apps.

⚠️ <b>ATTENTION:</b>
After payment, send the screenshot of the receipt right here 📸.
Wait <b>5-10 minutes</b>, our admins will verify and confirm your PRO status.

👨‍💻 <b>Admin / Contact:</b> @A_Husanboyev`
  }
};

// Start buyrug'i
bot.start((ctx) => {
  const payload = ctx.startPayload; // e.g. pay:1_month:123 or pay_1_oylik_123
  let selectedPlan = '1_month';
  let targetUserId = null;

  if (payload && (payload.startsWith('pay_') || payload.startsWith('pay:'))) {
    if (payload.includes(':')) {
      const parts = payload.split(':');
      selectedPlan = parts[1] || '1_month';
      targetUserId = parts[2] || null;
    } else {
      const parts = payload.split('_');
      targetUserId = parts[parts.length - 1] || null;
      selectedPlan = parts.slice(1, -1).join('_') || '1_month';
    }
  }

  userSessions.set(ctx.from.id, {
    lang: 'uz',
    plan: selectedPlan,
    userId: targetUserId,
    step: payload ? 'awaiting_receipt' : 'choose_lang'
  });

  // Agar saytdan pay_ parametri bilan kirgan bo'lsa, to'g'ridan-to'g'ri to'lov ko'rsatmasini chiqarish
  if (payload) {
    const details = PLAN_DETAILS[selectedPlan] || PLAN_DETAILS['1_month'] || PLAN_DETAILS['1m'];
    const t = texts['uz'];
    return ctx.reply(t.payment_info(details.label, details.amount), { parse_mode: 'HTML' });
  }

  return ctx.reply("Tilni tanlang / Выберите язык / Choose language:", 
    Markup.inlineKeyboard([
      [Markup.button.callback("🇺🇿 O'zbekcha", "lang_uz")],
      [Markup.button.callback("🇷🇺 Русский", "lang_ru")],
      [Markup.button.callback("🇬🇧 English", "lang_en")]
    ])
  );
});

// Help buyrug'i
bot.help((ctx) => {
  const helpMsg = `ℹ️ <b>UstaGo PRO Bot Yordam Bo'limi</b>

Quyidagi buyruqlardan foydalanishingiz mumkin:
/start - Botni qayta ishga tushirish va tariflarni tanlash
/help - Texnik yordam va ko'rsatmalar

👨‍💻 <b>Admin / Bog'lanish:</b> @A_Husanboyev`;

  return ctx.reply(helpMsg, { parse_mode: 'HTML' });
});

// Til tanlash
bot.action(/lang_(uz|ru|en)/, (ctx) => {
  const lang = ctx.match[1];
  const session = userSessions.get(ctx.from.id) || { plan: '1m', userId: null };
  session.lang = lang;
  session.step = 'choose_plan';
  userSessions.set(ctx.from.id, session);

  const t = texts[lang];
  return ctx.editMessageText(t.welcome, 
    Markup.inlineKeyboard([
      [Markup.button.callback(t.plans['1m'], 'plan_1m')],
      [Markup.button.callback(t.plans['3m'], 'plan_3m')],
      [Markup.button.callback(t.plans['6m'], 'plan_6m')],
      [Markup.button.callback(t.plans['life'], 'plan_life')]
    ])
  );
});

// Tarif tanlash
bot.action(/plan_(1m|3m|6m|life)/, (ctx) => {
  const planKey = ctx.match[1];
  const session = userSessions.get(ctx.from.id) || { lang: 'uz', userId: null };
  session.plan = planKey;
  session.step = 'awaiting_receipt';
  userSessions.set(ctx.from.id, session);

  const details = PLAN_DETAILS[planKey] || PLAN_DETAILS['1m'];
  const t = texts[session.lang || 'uz'];
  
  return ctx.editMessageText(t.payment_info(details.label, details.amount), { parse_mode: 'HTML' });
});

// Chek rasmini qabul qilish
bot.on('photo', async (ctx) => {
  const session = userSessions.get(ctx.from.id);
  const photo = ctx.message.photo[ctx.message.photo.length - 1];

  const plan = session?.plan || '1_month';
  const ustaId = session?.userId || 'unknown';
  const planDetails = PLAN_DETAILS[plan] || PLAN_DETAILS['1_month'] || PLAN_DETAILS['1m'];

  // Adminga chekni yuborish
  await ctx.telegram.sendPhoto(ADMIN_CHAT_ID, photo.file_id, {
    caption: `💳 <b>YANGI PRO TO'LOV CHEKI!</b>\n\n👤 <b>Usta ID:</b> <code>${ustaId}</code>\n📱 <b>Telegram:</b> @${ctx.from.username || 'yo\'q'} (ID: ${ctx.from.id})\n📦 <b>Tarif:</b> ${planDetails.label}\n💰 <b>Summa:</b> ${planDetails.amount} UZS\n\nTo'lovni tasdiqlaysizmi?`,
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard([
      [
        Markup.button.callback("✅ Tasdiqlash", `approve:${ustaId}:${plan}:${ctx.from.id}`),
        Markup.button.callback("❌ Rad etish", `reject:${ustaId}:${ctx.from.id}`)
      ]
    ])
  });

  const replyMsg = session?.lang === 'ru' 
    ? "✅ Скриншот чека принят! Наши администраторы проверят его в течение 5-10 минут.\n\n👨‍💻 Админ: @A_Husanboyev"
    : (session?.lang === 'en' ? "✅ Receipt screenshot received! Our admins will verify it within 5-10 minutes.\n\n👨‍💻 Admin: @A_Husanboyev" : "✅ Chek rasmi qabul qilindi! Adminlarimiz 5-10 daqiqa ichida tekshirib PRO maqomingizni tasdiqlaydi.\n\n👨‍💻 Admin / Bog'lanish: @A_Husanboyev");

  return ctx.reply(replyMsg);
});

// Admin Tasdiqlash / Rad etish (approve handler)
bot.action(/(?:approve_|approve:)(.+?)[_:]+(.+?)[_:]+(.+)/, async (ctx) => {
  const ustaId = ctx.match[1];
  const plan = ctx.match[2];
  const userTgId = ctx.match[3];

  console.log(`\n====================================================`);
  console.log(`[Admin Approve Clicked]`);
  console.log(`  - Target ustaId: "${ustaId}"`);
  console.log(`  - Target plan: "${plan}"`);
  console.log(`  - Sender userTgId: "${userTgId}"`);
  console.log(`  - Sender Telegram Username: "@${ctx.from?.username || 'yo\'q'}"`);

  // Plan nomini normallashtirish
  let normalizedPlan = '1_month';
  let expiresAt = new Date();
  let planLabel = "1 oylik";

  if (plan === '1m' || plan === '1_oylik' || plan === '1_month' || plan === '1') {
    normalizedPlan = '1_month';
    expiresAt.setDate(expiresAt.getDate() + 30);
    planLabel = "1 oylik";
  } else if (plan === '3m' || plan === '3_oylik' || plan === '3_months' || plan === '3') {
    normalizedPlan = '3_months';
    expiresAt.setDate(expiresAt.getDate() + 120);
    planLabel = "3 oylik (+1 oy bonus)";
  } else if (plan === '6m' || plan === '6_oylik' || plan === '6_months' || plan === '6') {
    normalizedPlan = '6_months';
    expiresAt.setDate(expiresAt.getDate() + 240);
    planLabel = "6 oylik (+2 oy bonus)";
  } else if (plan === 'life' || plan === 'lifetime') {
    normalizedPlan = 'lifetime';
    expiresAt = new Date('2099-01-01T00:00:00Z');
    planLabel = "Umrbod (Lifetime)";
  }

  const nowIso = new Date().toISOString();

  const updateData = {
    is_pro: true,
    is_verified: true,
    pro_plan: normalizedPlan,
    pro_started_at: nowIso,
    pro_activated_at: nowIso,
    pro_expires_at: expiresAt.toISOString(),
    max_portfolio: 15,
    banner_customization: true,
    show_congrats_modal: true,
    pro_modal_shown: false
  };

  console.log(`  - Supabase Update Payload:`, JSON.stringify(updateData, null, 2));

  let updatedRowsCount = 0;
  let updatedMasterRecord = null;

  // STEP 1: Try update by ID (String & Integer)
  if (ustaId && ustaId !== "Noma'lum / Saytdan kirmagan" && ustaId !== "unknown" && ustaId !== "oylik") {
    console.log(`🔍 [Step 1] Supabase 'ustalar' jadvalidan ID bo'yicha qidirilmoqda: "${ustaId}"`);

    // A. String ID
    try {
      const { data, error } = await supabase.from('ustalar').update(updateData).eq('id', ustaId).select();
      console.log(`  - Result eq('id', '${ustaId}'):`, { count: data?.length || 0, data, error });
      if (data && data.length > 0) {
        updatedRowsCount += data.length;
        updatedMasterRecord = data[0];
      }
    } catch (e) {
      console.error(`  - Error searching by string ID:`, e);
    }

    // B. Numeric ID if applicable
    if (updatedRowsCount === 0 && !isNaN(ustaId)) {
      const numId = parseInt(ustaId, 10);
      console.log(`🔍 [Step 1B] Supabase 'ustalar' jadvalidan Numeric ID bo'yicha qidirilmoqda: ${numId}`);
      try {
        const { data, error } = await supabase.from('ustalar').update(updateData).eq('id', numId).select();
        console.log(`  - Result eq('id', ${numId}):`, { count: data?.length || 0, data, error });
        if (data && data.length > 0) {
          updatedRowsCount += data.length;
          updatedMasterRecord = data[0];
        }
      } catch (e) {
        console.error(`  - Error searching by numeric ID:`, e);
      }
    }
  }

  // STEP 2: Try search & update by clean Telegram Username
  if (updatedRowsCount === 0 && ctx.from?.username) {
    const cleanUsername = ctx.from.username.replace('@', '').trim().toLowerCase();
    console.log(`🔍 [Step 2] ID bo'yicha topilmadi. Telegram username bo'yicha qidirilmoqda: "${cleanUsername}"`);

    try {
      const { data, error } = await supabase.from('ustalar').update(updateData).ilike('telegram', `%${cleanUsername}%`).select();
      console.log(`  - Result ilike('telegram', '%${cleanUsername}%'):`, { count: data?.length || 0, data, error });
      if (data && data.length > 0) {
        updatedRowsCount += data.length;
        updatedMasterRecord = data[0];
      }
    } catch (e) {
      console.error(`  - Error searching by telegram username:`, e);
    }
  }

  // STEP 3: Try search & update by Telegram ID (telegram_id)
  if (updatedRowsCount === 0 && userTgId) {
    console.log(`🔍 [Step 3] Telegram ID bo'yicha qidirilmoqda: "${userTgId}"`);
    try {
      const { data, error } = await supabase.from('ustalar').update(updateData).eq('telegram_id', userTgId).select();
      console.log(`  - Result eq('telegram_id', '${userTgId}'):`, { count: data?.length || 0, data, error });
      if (data && data.length > 0) {
        updatedRowsCount += data.length;
        updatedMasterRecord = data[0];
      }
    } catch (e) {}
  }

  // Sync update to profiles and users tables as well
  if (updatedMasterRecord?.id || ustaId) {
    const syncId = updatedMasterRecord?.id || ustaId;
    try { await supabase.from('profiles').update(updateData).eq('id', syncId).select(); } catch (e) {}
    try { await supabase.from('users').update(updateData).eq('id', syncId).select(); } catch (e) {}
  }

  // Check result & output explicit log
  if (updatedRowsCount === 0) {
    console.log(`❌ XATOLIK: Usta bazadan topilmadi! (Qidirilgan: ustaId="${ustaId}", username="@${ctx.from?.username || 'yo\'q'}", tgId="${userTgId}")`);
  } else {
    console.log(`✅ MUVAFFAQIYATLI: ${updatedRowsCount} ta usta PRO versiyaga o'tkazildi! (Usta Name: "${updatedMasterRecord?.name}", ID: ${updatedMasterRecord?.id})`);
  }
  console.log(`====================================================\n`);

  // Ustaga xabar yuborish
  try {
    const msg = `✅ <b>To'lovingiz tasdiqlandi! UstaGo PRO versiya faollashdi.</b>\n\n📦 Tanlangan tarif: <b>${planLabel}</b>\n\nSaytga kirib sahifani yangilang (refresh).\n\n<i>Eslatma: Obunangiz tugashiga 5 kun qolganida sizga avtomatik eslatma xabari yuboramiz.</i>\n\n👨‍💻 <i>Admin / Bog'lanish:</i> @A_Husanboyev`;
    await ctx.telegram.sendMessage(userTgId, msg, { parse_mode: 'HTML' });
  } catch (e) {
    console.error("User Telegram send error:", e);
  }

  try {
    await ctx.answerCbQuery(updatedRowsCount > 0 ? "PRO status muvaffaqiyatli faollashtirildi! ✅" : "Diqqat: Usta bazadan topilmadi ⚠️");
  } catch (e) {}

  const statusNote = updatedRowsCount > 0 ? "\n\n<b>✅ ADMIN TOMONIDAN TASDIQLANDI!</b>" : "\n\n<b>⚠️ TASDIQLANDI (Lekin bazadan usta topilmadi)</b>";
  return ctx.editMessageCaption((ctx.callbackQuery?.message?.caption || "") + statusNote, { parse_mode: 'HTML' });
});

// Direct PRO verification handler
bot.action(/verify_pro_(.+)/, async (ctx) => {
  const userId = ctx.match[1];
  const now = new Date().toISOString();

  try {
    const updateData = {
      is_pro: true,
      is_verified: true,
      pro_activated_at: now
    };

    const { error: err1 } = await supabase.from('ustalar').update(updateData).eq('id', userId);
    await supabase.from('profiles').update(updateData).eq('id', userId);

    if (!err1) {
      await ctx.answerCbQuery("Pro status muvaffaqiyatli berildi! ✅");
      if (ctx.callbackQuery?.message?.caption) {
        await ctx.editMessageCaption(
          ctx.callbackQuery.message.caption + `\n\n<b>✅ PRO VERSIYAGA O'TKAZILDI! (ID: ${userId})</b>`,
          { parse_mode: 'HTML' }
        );
      } else if (ctx.callbackQuery?.message) {
        await ctx.editMessageText(`✅ Ushbu usta Pro versiyaga o'tkazildi! (ID: ${userId})`);
      }
    } else {
      await ctx.answerCbQuery("Xatolik yuz berdi ❌", { show_alert: true });
    }
  } catch (err) {
    console.error("verify_pro error:", err);
    await ctx.answerCbQuery("Xatolik yuz berdi ❌", { show_alert: true });
  }
});

bot.action(/reject_(.+)_(.+)/, async (ctx) => {
  const [_, ustaId, userTgId] = ctx.match;

  try {
    await ctx.telegram.sendMessage(userTgId, "❌ To'lov cheki tasdiqlanmadi. Savollar bo'lsa adminga murojaat qiling: @A_Husanboyev");
  } catch (e) {}

  return ctx.editMessageCaption(ctx.callbackQuery.message.caption + "\n\n<b>❌ ADMIN TOMONIDAN RAD ETILDI!</b>", { parse_mode: 'HTML' });
});

// Global Error & Exception Handling
bot.catch((err, ctx) => {
  console.error(`[Telegraf Error] Exception occurred for ${ctx.updateType}:`, err);
});

process.on('uncaughtException', (err) => {
  console.error('[Fatal Error] Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Unhandled Rejection] Reason:', reason);
});

// Render.com Web Service Health Check Server (24/7 ishlashi uchun)
const http = require('http');
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('🤖 UstaGo PRO Telegram Bot status: 24/7 Active!');
});

server.listen(PORT, () => {
  console.log(`[Render Web Service] Health check server running on port ${PORT}`);
});

bot.launch()
  .then(() => {
    console.log('UstaGo PRO Bot muvaffaqiyatli ishga tushdi!');
    // Set bot commands menu
    bot.telegram.setMyCommands([
      { command: 'start', description: 'Botni ishga tushirish va tarif tanlash' },
      { command: 'help', description: 'Admin / Bog\'lanish: @A_Husanboyev' }
    ]).catch(() => {});
  })
  .catch((err) => console.error('Botni ishga tushirishda xatolik:', err));

process.once('SIGINT', () => {
  server.close();
  bot.stop('SIGINT');
});

process.once('SIGTERM', () => {
  server.close();
  bot.stop('SIGTERM');
});
