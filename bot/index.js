require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });
const { Telegraf, Markup } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');

// Konfiguratsiya
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8845833064:AAHB1nASi0Cwq8rZUQhvor008OX6dtQA4as';
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || '2067464475';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qmslmdtccekopxmgjkse.supabase.com';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_1iSPG6Kz2mC5T1SKG8vkEw_sIa1ssBW';

const bot = new Telegraf(BOT_TOKEN);
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Foydalanuvchi holatlari (In-Memory)
const userSessions = new Map();

// Tarif narxlari va nomlari
const PLAN_DETAILS = {
  '1m': { label: '1 Oylik PRO', amount: '1 000' },
  '3m': { label: '3 Oylik PRO (+1 oy bonus)', amount: '1 000' },
  '6m': { label: '6 Oylik PRO (+2 oy bonus)', amount: '1 000' },
  'life': { label: 'Umrbod PRO (Lifetime)', amount: '1 000' }
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
  const payload = ctx.startPayload; // pay_PLAN_USERID
  let selectedPlan = '1m';
  let targetUserId = null;

  if (payload && payload.startsWith('pay_')) {
    const parts = payload.split('_');
    selectedPlan = parts[1] || '1m';
    targetUserId = parts[2] || null;
  }

  userSessions.set(ctx.from.id, {
    lang: 'uz',
    plan: selectedPlan,
    userId: targetUserId,
    step: payload ? 'awaiting_receipt' : 'choose_lang'
  });

  // Agar saytdan pay_ parametri bilan kirgan bo'lsa, to'g'ridan-to'g'ri to'lov ko'rsatmasini chiqarish
  if (payload) {
    const details = PLAN_DETAILS[selectedPlan] || PLAN_DETAILS['1m'];
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

  const plan = session?.plan || '1m';
  const ustaId = session?.userId || 'Noma\'lum / Saytdan kirmagan';
  const planDetails = PLAN_DETAILS[plan] || PLAN_DETAILS['1m'];

  // Adminga chekni yuborish
  await ctx.telegram.sendPhoto(ADMIN_CHAT_ID, photo.file_id, {
    caption: `💳 <b>YANGI PRO TO'LOV CHEKI!</b>\n\n👤 <b>Usta ID:</b> <code>${ustaId}</code>\n📱 <b>Telegram:</b> @${ctx.from.username || 'yo\'q'} (ID: ${ctx.from.id})\n📦 <b>Tarif:</b> ${planDetails.label}\n💰 <b>Summa:</b> ${planDetails.amount} UZS\n\nTo'lovni tasdiqlaysizmi?`,
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard([
      [
        Markup.button.callback("✅ Tasdiqlash", `approve_${ustaId}_${plan}_${ctx.from.id}`),
        Markup.button.callback("❌ Rad etish", `reject_${ustaId}_${ctx.from.id}`)
      ]
    ])
  });

  const replyMsg = session?.lang === 'ru' 
    ? "✅ Скриншот чека принят! Наши администраторы проверят его в течение 5-10 минут.\n\n👨‍💻 Админ: @A_Husanboyev"
    : (session?.lang === 'en' ? "✅ Receipt screenshot received! Our admins will verify it within 5-10 minutes.\n\n👨‍💻 Admin: @A_Husanboyev" : "✅ Chek rasmi qabul qilindi! Adminlarimiz 5-10 daqiqa ichida tekshirib PRO maqomingizni tasdiqlaydi.\n\n👨‍💻 Admin / Bog'lanish: @A_Husanboyev");

  return ctx.reply(replyMsg);
});

// Admin Tasdiqlash / Rad etish
bot.action(/approve_(.+)_(.+)_(.+)/, async (ctx) => {
  const [_, ustaId, plan, userTgId] = ctx.match;

  // Muddatni hisoblash
  let expiresAt = new Date();
  let daysCount = 30;
  let planLabel = "1 oylik";

  if (plan === '1m' || plan === '1_oylik') {
    expiresAt.setMonth(expiresAt.getMonth() + 1);
    daysCount = 30;
    planLabel = "1 oylik";
  } else if (plan === '3m' || plan === '3_oylik') {
    expiresAt.setMonth(expiresAt.getMonth() + 4);
    daysCount = 120;
    planLabel = "3 oylik (+1 oy bonus)";
  } else if (plan === '6m' || plan === '6_oylik') {
    expiresAt.setMonth(expiresAt.getMonth() + 8);
    daysCount = 240;
    planLabel = "6 oylik (+2 oy bonus)";
  } else if (plan === 'life' || plan === 'lifetime') {
    expiresAt = new Date('2099-01-01T00:00:00Z');
    daysCount = 36500;
    planLabel = "Umrbod (Lifetime)";
  }

  // Supabase'da yangilash
  if (ustaId && ustaId !== "Noma'lum / Saytdan kirmagan") {
    const updateData = {
      is_pro: true,
      is_verified: true,
      pro_plan: plan,
      pro_expires_at: expiresAt.toISOString(),
      pro_activated_at: new Date().toISOString(),
      pro_modal_shown: false
    };
    await supabase.from('ustalar').update(updateData).eq('id', ustaId);
    await supabase.from('profiles').update(updateData).eq('id', ustaId);
  }

  // Ustaga xabar yuborish
  try {
    const msg = `✅ <b>To'lovingiz tasdiqlandi! UstaGo PRO versiya faollashdi.</b>\n\n📦 Tanlangan tarif: <b>${planLabel}</b>\n\nSaytga kirib sahifani yangilang (refresh).\n\n<i>Eslatma: Obunangiz tugashiga 5 kun qolganida sizga avtomatik eslatma xabari yuboramiz.</i>\n\n👨‍💻 <i>Admin / Bog'lanish:</i> @A_Husanboyev`;
    await ctx.telegram.sendMessage(userTgId, msg, { parse_mode: 'HTML' });
  } catch (e) {
    console.error("User Telegram send error:", e);
  }

  return ctx.editMessageCaption(ctx.callbackQuery.message.caption + "\n\n<b>✅ ADMIN TOMONIDAN TASDIQLANDI!</b>", { parse_mode: 'HTML' });
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

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
