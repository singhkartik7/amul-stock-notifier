const TelegramBot = require("node-telegram-bot-api");

const {
    disableTelegram
} = require("./models/preferenceModel");

const bot = new TelegramBot(process.env.BOT_TOKEN);

async function sendNotification(

    chatId,

    product,

    pincode

) {

    try {

        const parts = product.name.split(",");

const productTitle = parts[0];

const productDetails = parts

                .slice(1)

                .join(",")

                .trim();

        const message = `
🚨 <b>Stock Alert!</b>

📦 <b>${productTitle}</b>
${productDetails}

📍 Pincode - <b>${pincode}</b>

📦 Available Quantity - <b>${product.inventory_quantity}</b>

🛒 <a href="${product.url}"><b>Buy Now</b></a>
`;

        await bot.sendMessage(

            chatId,

            message,

            {

                parse_mode: "HTML",

                disable_web_page_preview: true

            }

        );

      console.log(
    `✅ Sent → ${pincode} | ${product.product_name} | Qty: ${product.inventory_quantity}`
);

    }

  catch (err) {

    const code = err.response?.body?.error_code;

    if (code === 401) {
        console.log("❌ Invalid Telegram Bot Token");
        return;
    }

   if (code === 403) {

    const now = new Date().toLocaleString("en-IN");

    console.log(`
====================================
❌ [${now}]
Telegram Notification Failed
====================================

Chat ID : ${chatId}

Reason  : User blocked the bot (403)

Action  : Removing Chat ID...

====================================
`);

    try {

        await disableTelegram(chatId);

        console.log(`
====================================
🧹 Telegram Cleanup
====================================

Chat ID : ${chatId}

Status  : Chat ID removed successfully.

User will no longer be checked
until Telegram is connected again.

====================================
`);

    } catch (dbErr) {

        console.error(`
====================================
❌ Database Cleanup Failed
====================================

Chat ID : ${chatId}

Reason  : ${dbErr.message}

====================================
`);
    }

    return;
}

    const now = new Date().toLocaleString("en-IN");

console.log(`
====================================
❌ [${now}]
Telegram Error
====================================

Chat ID : ${chatId}

Code    : ${code || "Unknown"}

Reason  : ${err.response?.body?.description || err.message}

Product : ${product.name}

Pincode : ${pincode}

====================================
`);

console.error(err);
}

}

module.exports = {

    sendNotification

};