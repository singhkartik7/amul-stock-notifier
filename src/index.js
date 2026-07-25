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
    getProducts
} = require("./services/productService");

let isRunning = false;

async function checkStock() {

    if (isRunning) {

        console.log("Previous check still running...");

        return;

    }

    isRunning = true;

    const totalStart = Date.now();

    try {

        const groupedPreferences =
            await getGroupedPreferences();

        const stockMap =
            await loadStockMap();

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

                console.log(`Checking store ${storeId}`);

                const apiStart = Date.now();

                const products = await getProducts(

                    storeId,

                   

                );

                console.log(

                    `   API Response   : ${Date.now() - apiStart} ms`

                );

                const processStart = Date.now();

               productsFound += await processProducts(

    {
        data: products
    },

    group.users,

    stockMap,

    sendNotification,

    shouldNotify,

    storeId

);

                console.log(

                    `   Process Data   : ${Date.now() - processStart} ms`

                );

                console.log(

                    `   TOTAL          : ${Date.now() - apiStart} ms\n`

                );

            }

            catch (err) {

                console.log(

                    `Error checking store ${storeId}:`,

                    err.message

                );

            }

        }

        console.log(

`====================================
Stock Check Finished
====================================
Time: ${(Date.now() - totalStart) / 1000} sec
Products Found: ${productsFound}
Stores Checked: ${Object.keys(activeGroupedPreferences).length}
====================================`

        );

    }

    catch (err) {

        console.log(err);

    }

    finally {

        isRunning = false;

    }

}

function startStockChecker() {

    checkStock();

    setInterval(() => {

        console.log("\n=================================");

        console.log(

            "Checking stock:",

            new Date().toLocaleString()

        );

        console.log("=================================\n");

        checkStock();

    }, 1.2 * 60 * 1000);

}

module.exports = {

    startStockChecker

};

