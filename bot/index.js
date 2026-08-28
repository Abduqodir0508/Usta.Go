require('dotenv').config({ path: '../.env.local' });
const { Telegraf, Markup } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8845833064:AAHB1nASi0Cwq8rZUQhvor008OX6dtQA4as";
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || "2067464475";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);
const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

// State to track users who need to send a receipt
const pendingPayments = new Map();

bot.start((ctx) => {
  const payload = ctx.startPayload;
  
  if (payload && payload.startsWith('pay_')) {
    // Format: pay_PLAN_USERID
    const parts = payload.split('_');
    
    // the plan name might have underscores in it, but since we encode it, we can just split
    // e.g., pay_Oylik%20PRO_1234
    if (parts.length >= 3) {
      const planName = decodeURIComponent(parts[1]);
      const userId = parts.slice(2).join('_'); // in case userId has underscores, though it shouldn't
      
      pendingPayments.set(ctx.from.id, {
        userId,
        planName,
      });

      return ctx.reply(
        `💳 Siz "${planName}" tarifini tanladingiz.\n\nIltimos, to'lovni amalga oshirganingizni tasdiqlovchi chekni (skrinshotni) shu yerga rasm sifatida yuboring.`
      );
    }
  }

  return ctx.reply("Assalomu alaykum! Men UstaGo PRO to'lovlarini qabul qiluvchi botman.");
});

bot.on('photo', async (ctx) => {
  const userIdTg = ctx.from.id;
  
  if (pendingPayments.has(userIdTg)) {
    const paymentData = pendingPayments.get(userIdTg);
    const photo = ctx.message.photo[ctx.message.photo.length - 1]; // get highest resolution photo
    
    const caption = `💳 YANGI PRO TO'LOV CHEKI!\n\n👤 Usta ID: ${paymentData.userId}\n📦 Paket: ${paymentData.planName}\n💰 Summa: 1 000 UZS (Test)\n⏳ Tasdiqlaysizmi?`;

    // Send to admin
    try {
      await ctx.telegram.sendPhoto(ADMIN_CHAT_ID, photo.file_id, {
        caption: caption,
        reply_markup: {
          inline_keyboard: [
            [
              Markup.button.callback("✅ Tasdiqlash", `approve_${paymentData.userId}_${paymentData.planName}_${userIdTg}`),
              Markup.button.callback("❌ Rad etish", `reject_${paymentData.userId}_${userIdTg}`)
            ]
          ]
        }
      });
      
      pendingPayments.delete(userIdTg); // clear state
      return ctx.reply("✅ Chek qabul qilindi va adminga yuborildi. Iltimos, tasdiqlanishini kuting.");
    } catch (error) {
      console.error("Error sending to admin:", error);
      return ctx.reply("Xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko'ring.");
    }
  } else {
    return ctx.reply("Kechirasiz, avval sayt orqali kerakli tarifni tanlab, 'Chekni Botga Yuborish' tugmasi orqali kiring.");
  }
});

// Inline button actions
bot.action(/approve_(.+)_(.+)_(.+)/, async (ctx) => {
  const masterId = ctx.match[1];
  const planName = ctx.match[2];
  const userTgId = ctx.match[3];

  try {
    // Supabase update
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1); // Mock 1 month expiration

    const { error } = await supabase
      .from('ustalar')
      .update({
        is_pro: true,
        pro_plan: planName,
        pro_expires_at: expiresAt.toISOString()
      })
      .eq('id', masterId);

    if (error) {
      console.error("Supabase Error:", error);
      await ctx.answerCbQuery("Bazaga saqlashda xatolik yuz berdi!", { show_alert: true });
      return;
    }

    // Edit message
    await ctx.editMessageCaption(`✅ Tasdiqlandi!\n\n👤 Usta ID: ${masterId}\n📦 Paket: ${planName}`);
    
    // Notify user
    await ctx.telegram.sendMessage(userTgId, "To'lovingiz tasdiqlandi! PRO profilingiz faollashtirildi 🎉");
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
    await ctx.editMessageCaption(`❌ Rad etildi!\n\n👤 Usta ID: ${masterId}`);
    
    // Notify user
    await ctx.telegram.sendMessage(userTgId, "To'lov cheki tasdiqlanmadi. Iltimos, ma'lumotlarni qayta tekshirib yuboring.");
    await ctx.answerCbQuery("Rad etildi!");
  } catch (err) {
    console.error(err);
    await ctx.answerCbQuery("Xatolik!", { show_alert: true });
  }
});

bot.launch().then(() => {
  console.log('🤖 Telegram bot is running...');
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
