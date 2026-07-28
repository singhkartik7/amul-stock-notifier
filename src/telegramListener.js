require("dotenv").config();
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
const axios = require("axios");

const TelegramBot = require("node-telegram-bot-api");
console.log("Telegram listener started");
const bot = new TelegramBot(
    process.env.BOT_TOKEN,
    {
        polling: true
    }
);
const API_URL = process.env.API_URL;
bot.onText(/^\/start(?:\s+(.+))?$/, async (msg, match) => {

    const chatId = msg.chat.id;

    const token = match[1];

    console.log("Chat ID:", chatId);

    console.log("Token:", token);

    if (!token) {

        bot.sendMessage(
            chatId,
            "Please connect from the dashboard."
        );

        return;

    }

    try {

        await axios.post(
            `${API_URL}/telegram/connect`,
            {
                token,
                chatId
            }
        );

        bot.sendMessage(
            chatId,
            "✅ Telegram connected successfully!"
        );

    }
    catch (err) {

        console.log(err.message);

        bot.sendMessage(
            chatId,
            "❌ Failed to connect."
        );

    }

});