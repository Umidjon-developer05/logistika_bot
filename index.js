const TelegramBot = require("node-telegram-bot-api");
const schedule = require("node-schedule");
const { default: job } = require("./cron");
const express = require("express");
require("dotenv").config();

const TOKEN = "8091561842:AAHcM8fFY2hjtY2L5sxSVI0hlS6nv1N-CP4";
const ADMIN_ID = 6038292163;
const groupIds = [-1002206637188];

const bot = new TelegramBot(TOKEN, { polling: true });
const app = express();

const PORT = 3000;
app.get("/", (req, res) => {
  res.send("Bot ishlayapti 🚀");
});
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

let step = 0;
let tempMessage = "";
let tempMinutes = null;

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  if (chatId !== ADMIN_ID) {
    return bot.sendMessage(chatId, "❌ Sizda ruxsat yo‘q.");
  }
});

bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (step === 0) {
    bot.sendMessage(chatId, "📩 Yuboriladigan matnni kiriting:");
    step = 1;
    return;
  }

  if (step === 1) {
    tempMessage = text;
    bot.sendMessage(chatId, "⏳ Necha minutdan keyin yuboray?");
    step = 2;
    return;
  }

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

      step = 0;
      tempMessage = "";
      tempMinutes = null;
    });

    step = 3;
  }
});

job.start();
console.log("Cron job started. GET request will be sent every 14 minutes.");
