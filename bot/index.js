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

// Matnlar (3 tilda)
const texts = {
  uz: {
    welcome: "👋 Assalomu alaykum! UstaGo PRO rasmiy to'lov botiga xush kelibsiz.\n\nQuyidagi tariflardan birini tanlang:",
    plans: {
      '1m': '1 Oylik PRO (1 000 UZS)',
      '3m': '3 Oylik PRO (+1 oy bonus) (1 000 UZS)',
      '6m': '6 Oylik PRO (+2 oy bonus) (1 000 UZS)',
      'life': '👑 Umrbod PRO (1 000 UZS)'
    },
    payment_info: (plan) => `📦 Tanlangan tarif: <b>${plan}</b>\n💰 To'lov summasi: <b>1 000 UZS (Test)</b>\n💳 Karta raqam: <code>5614 6887 1438 0671</code> (M.S)\n\nTo'lovni amalga oshirgach, to'lov cheki skrinshotini (rasmini) shu yerga yuboring 📸`
  },
  ru: {
    welcome: "👋 Здравствуйте! Добро пожаловать в официальный платежный бот UstaGo PRO.\n\nВыберите один из тарифов:",
    plans: {
      '1m': '1 Месяц PRO (1 000 UZS)',
      '3m': '3 Месяца PRO (+1 мес бонус) (1 000 UZS)',
      '6m': '6 Месяцев PRO (+2 мес бонус) (1 000 UZS)',
      'life': '👑 Пожизненный PRO (1 000 UZS)'
    },
    payment_info: (plan) => `📦 Выбранный тариф: <b>${plan}</b>\n💰 Сумма к оплате: <b>1 000 UZS (Тест)</b>\n💳 Номер карты: <code>5614 6887 1438 0671</code> (M.S)\n\nПосле оплаты отправьте скриншот чека сюда 📸`
  },
  en: {
    welcome: "👋 Hello! Welcome to UstaGo PRO official payment bot.\n\nChoose a plan:",
    plans: {
      '1m': '1 Month PRO (1 000 UZS)',
      '3m': '3 Months PRO (+1 mo bonus) (1 000 UZS)',
      '6m': '6 Months PRO (+2 mo bonus) (1 000 UZS)',
      'life': '👑 Lifetime PRO (1 000 UZS)'
    },
    payment_info: (plan) => `📦 Selected plan: <b>${plan}</b>\n💰 Price: <b>1 000 UZS (Test)</b>\n💳 Card: <code>5614 6887 1438 0671</code> (M.S)\n\nAfter payment, send the receipt screenshot here 📸`
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
    step: 'choose_lang'
  });

  return ctx.reply("Tilni tanlang / Выберите язык / Choose language:", 
    Markup.inlineKeyboard([
      [Markup.button.callback("🇺🇿 O'zbekcha", "lang_uz")],
      [Markup.button.callback("🇷🇺 Русский", "lang_ru")],
      [Markup.button.callback("🇬🇧 English", "lang_en")]
    ])
  );
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
  const plan = ctx.match[1];
  const session = userSessions.get(ctx.from.id) || { lang: 'uz', userId: null };
  session.plan = plan;
  session.step = 'awaiting_receipt';
  userSessions.set(ctx.from.id, session);

  const t = texts[session.lang || 'uz'];
  return ctx.editMessageText(t.payment_info(t.plans[plan]), { parse_mode: 'HTML' });
});

// Chek rasmini qabul qilish
bot.on('photo', async (ctx) => {
  const session = userSessions.get(ctx.from.id);
  const photo = ctx.message.photo[ctx.message.photo.length - 1];

  const plan = session?.plan || '1m';
  const ustaId = session?.userId || 'Noma\'lum / Saytdan kirmagan';

  // Adminga chekni yuborish
  await ctx.telegram.sendPhoto(ADMIN_CHAT_ID, photo.file_id, {
    caption: `💳 <b>YANGI PRO TO'LOV CHEKI!</b>\n\n👤 <b>Usta ID:</b> <code>${ustaId}</code>\n📱 <b>Telegram:</b> @${ctx.from.username || 'yo\'q'} (ID: ${ctx.from.id})\n📦 <b>Tarif:</b> ${plan}\n💰 <b>Summa:</b> 1 000 UZS\n\nTo'lovni tasdiqlaysizmi?`,
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard([
      [
        Markup.button.callback("✅ Tasdiqlash", `approve_${ustaId}_${plan}_${ctx.from.id}`),
        Markup.button.callback("❌ Rad etish", `reject_${ustaId}_${ctx.from.id}`)
      ]
    ])
  });

  const replyMsg = session?.lang === 'ru' 
    ? "✅ Чек принят! Ожидайте подтверждения администратора."
    : (session?.lang === 'en' ? "✅ Receipt received! Waiting for admin approval." : "✅ Chek qabul qilindi! Admin tasdiqlashini kuting.");

  return ctx.reply(replyMsg);
});

// Admin Tasdiqlash / Rad etish
bot.action(/approve_(.+)_(.+)_(.+)/, async (ctx) => {
  const [_, ustaId, plan, userTgId] = ctx.match;

  // Muddatni hisoblash
  let expiresAt = new Date();
  if (plan === '1m') expiresAt.setMonth(expiresAt.getMonth() + 1);
  else if (plan === '3m') expiresAt.setMonth(expiresAt.getMonth() + 4);
  else if (plan === '6m') expiresAt.setMonth(expiresAt.getMonth() + 8);
  else if (plan === 'life') expiresAt = new Date('2099-01-01T00:00:00Z');

  // Supabase'da yangilash
  if (ustaId && ustaId !== "Noma'lum / Saytdan kirmagan") {
    const updateData = {
      is_pro: true,
      is_verified: true,
      pro_plan: plan,
      pro_expires_at: expiresAt.toISOString(),
      pro_activated_at: new Date().toISOString()
    };
    await supabase.from('ustalar').update(updateData).eq('id', ustaId);
    await supabase.from('profiles').update(updateData).eq('id', ustaId);
  }

  // Ustaga xabar yuborish
  try {
    await ctx.telegram.sendMessage(userTgId, "🎉 To'lovingiz tasdiqlandi! UstaGo PRO faollashtirildi.");
  } catch (e) {}

  return ctx.editMessageCaption(ctx.callbackQuery.message.caption + "\n\n<b>✅ ADMIN TOMONIDAN TASDIQLANDI!</b>", { parse_mode: 'HTML' });
});

// Direct PRO verification handler (e.g. verify_pro_USER_ID)
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
    await ctx.telegram.sendMessage(userTgId, "❌ To'lov cheki tasdiqlanmadi. Savollar bo'lsa adminga murojaat qiling.");
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
  .then(() => console.log('UstaGo PRO Bot muvaffaqiyatli ishga tushdi!'))
  .catch((err) => console.error('Botni ishga tushirishda xatolik:', err));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
