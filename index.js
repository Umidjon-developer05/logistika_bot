const TelegramBot = require("node-telegram-bot-api");
const schedule = require("node-schedule");

const TOKEN = "8091561842:AAHcM8fFY2hjtY2L5sxSVI0hlS6nv1N-CP4"; // BotFather'dan olasan
const ADMIN_ID = 6038292163; // Admin Telegram ID
const groupIds = [-1002206637188]; // Guruh ID'lar

const bot = new TelegramBot(TOKEN, { polling: true });

let step = 0;
let tempMessage = "";
let tempMinutes = null;

bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Faqat admin ishlata oladi
  if (chatId !== ADMIN_ID) {
    return bot.sendMessage(chatId, "❌ Sizda ruxsat yo‘q.");
  }

  // 0-bosqich: boshlanish
  if (step === 0) {
    bot.sendMessage(chatId, "📩 Yuboriladigan matnni kiriting:");
    step = 1;
    return;
  }

  // 1-bosqich: matn qabul qilish
  if (step === 1) {
    tempMessage = text;
    bot.sendMessage(chatId, "⏳ Necha minutdan keyin yuboray?");
    step = 2;
    return;
  }

  // 2-bosqich: vaqtni qabul qilish
  if (step === 2) {
    tempMinutes = parseInt(text);

    if (isNaN(tempMinutes) || tempMinutes <= 0) {
      return bot.sendMessage(chatId, "❌ Noto‘g‘ri vaqt. Qayta kiriting:");
    }

    const sendTime = new Date(Date.now() + tempMinutes * 60000);

    bot.sendMessage(
      chatId,
      `✅ Xabar ${tempMinutes} minutdan keyin yuboriladi.`
    );

    schedule.scheduleJob(sendTime, () => {
      groupIds.forEach((gid) => {
        bot
          .sendMessage(gid, tempMessage)
          .then(() => console.log(`✅ Yuborildi: ${gid}`))
          .catch((err) => console.error(`❌ Xatolik (${gid}):`, err.message));
      });

      // Reset
      step = 0;
      tempMessage = "";
      tempMinutes = null;
    });

    step = 3; // kutish holati
  }
});
