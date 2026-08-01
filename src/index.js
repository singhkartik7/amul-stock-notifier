require("dotenv").config();

const { processProducts } = require("./products");
const { shouldNotify } = require("./notifier");
const { sendNotification } = require("./telegram");

const {
    getGroupedPreferences
} = require("./models/preferenceModel");

const {
    loadStockMap
} = require("./models/stockModel");

const {
    loadUserNotifiedMap
} = require("./models/userNotificationModel");

const {
    getProducts
} = require("./services/productService");

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let isRunning = false;

async function checkStock() {

    if (isRunning) {

        console.log("⏳ Previous scan still running. Skipping...");
        return;

    }

    isRunning = true;

    const totalStart = Date.now();

    try {

        const groupedPreferences =
            await getGroupedPreferences();

        const stockMap =
            await loadStockMap();

        const userNotifiedMap =
            await loadUserNotifiedMap();

        const activeGroupedPreferences = {};

        for (const [storeId, group] of Object.entries(groupedPreferences)) {

            const activeUsers = group.users.filter(user =>

                user.notifyUntil &&
                new Date(user.notifyUntil) > new Date()

            );

            if (activeUsers.length > 0) {

                activeGroupedPreferences[storeId] = {

                    users: activeUsers

                };

            }

        }

        let productsFound = 0;

        for (const [storeId, group] of Object.entries(activeGroupedPreferences)) {

            try {

                const storeStart = Date.now();

                const products = await getProducts(storeId);

                productsFound += await processProducts(

                    {
                        data: products
                    },

                    group.users,

                    stockMap,

                    userNotifiedMap,

                    sendNotification,

                    shouldNotify,

                    storeId

                );

               console.log(
    `📦 ${group.alias} | ${storeId} | ${((Date.now() - storeStart) / 1000).toFixed(1)}s`
);

                await sleep(500);

            }

            catch (err) {

                console.error(
                    `❌ Store ${storeId}: ${err.message}`
                );

            }

        }

        console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Scan Complete
📦 Stores   : ${Object.keys(activeGroupedPreferences).length}
🛒 Products : ${productsFound}
⏱️ Time     : ${((Date.now() - totalStart) / 1000).toFixed(1)}s
━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

    }

    catch (err) {

        console.error("❌ Stock checker failed:", err.message);

    }

    finally {

        isRunning = false;

    }

}

function startStockChecker() {

    console.log("🚀 Stock checker started");

    checkStock();

    setInterval(() => {

        console.log(
            `\n🔄 Starting stock scan • ${new Date().toLocaleString("en-IN")}\n`
        );

        checkStock();

    }, 1.2 * 60 * 1000);

}

module.exports = {

    startStockChecker

};