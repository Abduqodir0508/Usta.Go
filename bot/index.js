require('dotenv').config({ path: '../.env.local' });
const { Telegraf, Markup } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8845833064:AAHB1nASi0Cwq8rZUQhvor008OX6dtQA4as";
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || "2067464475";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
// Use SERVICE_ROLE_KEY if available for bypass RLS, fallback to anon
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);
const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

// State to track users
const userStates = new Map();

const dict = {
  UZ: {
    welcome: "Assalomu alaykum! Tilni tanlang:",
    menuDesc: "Quyidagi tariflardan birini tanlang:",
    plan1: "1 Oylik PRO (Test: 1 000 UZS)",
    plan3: "3 Oylik PRO (+1 oy bonus) (Test: 1 000 UZS)",
    plan6: "6 Oylik PRO (+2 oy bonus) (Test: 1 000 UZS)",
    planLife: "Umrbod PRO (Test: 1 000 UZS)",
    paymentInfo: (planName) => `💳 To'lov uchun karta: \`8600 1234 5678 9012\` (UstaGo Rasmiy Hisobi)\n💰 Summa: 1 000 UZS (Test)\n📸 ${planName} uchun to'lovni amalga oshirib, to'lov cheki skrinshotini (rasmini) shu botga yuboring.`,
    receiptReceived: "✅ Chek qabul qilindi va adminga yuborildi. Iltimos, tasdiqlanishini kuting.",
    receiptError: "Xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko'ring.",
    needPlanError: "Kechirasiz, avval sayt orqali kerakli tarifni tanlab, yoki quyidagi menyudan tanlang:",
    successMsg: "🎉 To'lovingiz muvaffaqiyatli tasdiqlandi! UstaGo PRO profilingiz faollashtirildi.",
    rejectMsg: "❌ To'lov cheki tasdiqlanmadi yoki xato yuborildi. Savollar bo'lsa adminga murojaat qiling: @admin_username"
  },
  RU: {
    welcome: "Здравствуйте! Выберите язык:",
    menuDesc: "Выберите один из тарифов ниже:",
    plan1: "1 Месяц PRO (Тест: 1 000 UZS)",
    plan3: "3 Месяца PRO (+1 месяц бонус) (Тест: 1 000 UZS)",
    plan6: "6 Месяцев PRO (+2 месяца бонус) (Тест: 1 000 UZS)",
    planLife: "Пожизненный PRO (Тест: 1 000 UZS)",
    paymentInfo: (planName) => `💳 Карта для оплаты: \`8600 1234 5678 9012\` (Официальный счет UstaGo)\n💰 Сумма: 1 000 UZS (Тест)\n📸 Оплатите ${planName} и отправьте скриншот (фото) чека об оплате в этот бот.`,
    receiptReceived: "✅ Чек получен и отправлен администратору. Пожалуйста, ожидайте подтверждения.",
    receiptError: "Произошла ошибка. Пожалуйста, попробуйте позже.",
    needPlanError: "Извините, сначала выберите нужный тариф через сайт или выберите из меню ниже:",
    successMsg: "🎉 Ваша оплата успешно подтверждена! Ваш профиль UstaGo PRO активирован.",
    rejectMsg: "❌ Чек об оплате не подтвержден или отправлен с ошибкой. При возникновении вопросов обращайтесь к администратору: @admin_username"
  },
  EN: {
    welcome: "Hello! Choose your language:",
    menuDesc: "Choose one of the plans below:",
    plan1: "1 Month PRO (Test: 1 000 UZS)",
    plan3: "3 Months PRO (+1 month bonus) (Test: 1 000 UZS)",
    plan6: "6 Months PRO (+2 months bonus) (Test: 1 000 UZS)",
    planLife: "Lifetime PRO (Test: 1 000 UZS)",
    paymentInfo: (planName) => `💳 Card for payment: \`8600 1234 5678 9012\` (UstaGo Official Account)\n💰 Amount: 1 000 UZS (Test)\n📸 Make the payment for ${planName} and send a screenshot (photo) of the payment receipt to this bot.`,
    receiptReceived: "✅ Receipt received and sent to admin. Please wait for confirmation.",
    receiptError: "An error occurred. Please try again later.",
    needPlanError: "Sorry, please select the required plan through the site first, or choose from the menu below:",
    successMsg: "🎉 Your payment has been successfully confirmed! Your UstaGo PRO profile has been activated.",
    rejectMsg: "❌ Payment receipt was not confirmed or sent with an error. If you have any questions, contact the administrator: @admin_username"
  }
};

bot.start((ctx) => {
  const payload = ctx.startPayload;
  
  if (payload && payload.startsWith('pay_')) {
    const parts = payload.split('_');
    if (parts.length >= 3) {
      const planNameRaw = decodeURIComponent(parts[1]);
      const userId = parts.slice(2).join('_');
      
      // Default state
      userStates.set(ctx.from.id, {
        userId,
        planNameRaw,
        lang: 'UZ' // default before selection
      });
    }
  } else {
    userStates.set(ctx.from.id, {
      userId: null,
      planNameRaw: null,
      lang: 'UZ'
    });
  }

  return ctx.reply("Tilni tanlang / Выберите язык / Choose language:", 
    Markup.inlineKeyboard([
      [Markup.button.callback("🇺🇿 O'zbekcha", "lang_UZ")],
      [Markup.button.callback("🇷🇺 Русский", "lang_RU")],
      [Markup.button.callback("🇬🇧 English", "lang_EN")]
    ])
  );
});

bot.action(/lang_(UZ|RU|EN)/, async (ctx) => {
  const lang = ctx.match[1];
  const t = dict[lang];
  const userIdTg = ctx.from.id;

  let state = userStates.get(userIdTg) || { userId: null, planNameRaw: null };
  state.lang = lang;
  userStates.set(userIdTg, state);

  await ctx.answerCbQuery();
  
  if (state.planNameRaw && state.userId) {
    // If they came from the site with a plan
    await ctx.reply(t.paymentInfo(state.planNameRaw), { parse_mode: 'Markdown' });
  } else {
    // If they just typed /start without payload
    await ctx.reply(t.menuDesc, Markup.keyboard([
      [t.plan1],
      [t.plan3],
      [t.plan6],
      [t.planLife]
    ]).resize());
  }
});

// Handle custom keyboard plan selections
bot.hears(/(1 Oylik PRO|1 Месяц PRO|1 Month PRO)/i, (ctx) => handlePlanSelection(ctx, "1_oylik"));
bot.hears(/(3 Oylik PRO|3 Месяца PRO|3 Months PRO)/i, (ctx) => handlePlanSelection(ctx, "3_oylik"));
bot.hears(/(6 Oylik PRO|6 Месяцев PRO|6 Months PRO)/i, (ctx) => handlePlanSelection(ctx, "6_oylik"));
bot.hears(/(Umrbod PRO|Пожизненный PRO|Lifetime PRO)/i, (ctx) => handlePlanSelection(ctx, "lifetime"));

function handlePlanSelection(ctx, planId) {
  const userIdTg = ctx.from.id;
  let state = userStates.get(userIdTg) || { lang: 'UZ' };
  state.planNameRaw = planId;
  if (!state.userId) state.userId = "unknown"; // from direct bot use
  
  userStates.set(userIdTg, state);
  const t = dict[state.lang];
  
  return ctx.reply(t.paymentInfo(planId), { parse_mode: 'Markdown' });
}

bot.on('photo', async (ctx) => {
  const userIdTg = ctx.from.id;
  const state = userStates.get(userIdTg);
  
  if (state && state.planNameRaw) {
    const t = dict[state.lang || 'UZ'];
    const photo = ctx.message.photo[ctx.message.photo.length - 1];
    
    // Always UZ for admin
    const caption = `🔔 YANGI PRO TO'LOV CHEKI!\n👤 Usta ID: ${state.userId}\n📦 Paket: ${state.planNameRaw}\n💰 Summa: 1 000 UZS (Test)\n⏳ Holat: Tekshirilmoqda`;

    try {
      await ctx.telegram.sendPhoto(ADMIN_CHAT_ID, photo.file_id, {
        caption: caption,
        reply_markup: {
          inline_keyboard: [
            [
              Markup.button.callback("✅ Tasdiqlash", `approve_${state.userId}_${state.planNameRaw}_${userIdTg}`),
              Markup.button.callback("❌ Rad etish", `reject_${state.userId}_${userIdTg}`)
            ]
          ]
        }
      });
      
      // Clear plan waiting state but keep language maybe
      state.planNameRaw = null;
      userStates.set(userIdTg, state);
      
      return ctx.reply(t.receiptReceived);
    } catch (error) {
      console.error("Error sending to admin:", error);
      return ctx.reply(t.receiptError);
    }
  } else {
    const t = dict[state?.lang || 'UZ'];
    return ctx.reply(t.needPlanError);
  }
});

bot.action(/approve_(.+)_(.+)_(.+)/, async (ctx) => {
  const masterId = ctx.match[1];
  const planName = ctx.match[2]; // e.g. 1_oylik, 3_oylik, 6_oylik, lifetime
  const userTgId = ctx.match[3];

  try {
    let expiresAt = null; // null for lifetime
    
    if (planName !== 'lifetime') {
      expiresAt = new Date();
      if (planName.includes('1')) {
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      } else if (planName.includes('3')) {
        expiresAt.setMonth(expiresAt.getMonth() + 4); // 3 + 1 bonus
      } else if (planName.includes('6')) {
        expiresAt.setMonth(expiresAt.getMonth() + 8); // 6 + 2 bonus
      } else {
        // default 1 month fallback
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      }
    }

    if (masterId !== "unknown") {
      const { error } = await supabase
        .from('ustalar')
        .update({
          is_pro: true,
          pro_plan: planName,
          pro_expires_at: expiresAt ? expiresAt.toISOString() : '2099-01-01T00:00:00.000Z'
        })
        .eq('id', masterId);

      if (error) {
        console.error("Supabase Error:", error);
        await ctx.answerCbQuery("Bazaga saqlashda xatolik yuz berdi!", { show_alert: true });
        return;
      }
    }

    // Edit admin message
    await ctx.editMessageCaption(`✅ Tasdiqlandi!\n👤 Usta ID: ${masterId}\n📦 Paket: ${planName}`);
    
    // Notify user in their language
    const state = userStates.get(parseInt(userTgId)) || { lang: 'UZ' };
    const t = dict[state.lang];
    
    await ctx.telegram.sendMessage(userTgId, t.successMsg);
    await ctx.answerCbQuery("Usta PRO qilindi!");
    
  } catch (err) {
    console.error(err);
    await ctx.answerCbQuery("Xatolik!", { show_alert: true });
  }
});

bot.action(/reject_(.+)_(.+)/, async (ctx) => {
  const masterId = ctx.match[1];
  const userTgId = ctx.match[2];

  try {
    await ctx.editMessageCaption(`❌ Rad etildi!\n👤 Usta ID: ${masterId}`);
    
    // Notify user
    const state = userStates.get(parseInt(userTgId)) || { lang: 'UZ' };
    const t = dict[state.lang];
    
    await ctx.telegram.sendMessage(userTgId, t.rejectMsg);
    await ctx.answerCbQuery("Rad etildi!");
  } catch (err) {
    console.error(err);
    await ctx.answerCbQuery("Xatolik!", { show_alert: true });
  }
});

bot.launch().then(() => {
  console.log('🤖 Telegram bot is running with i18n...');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
