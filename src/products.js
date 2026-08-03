const {
    generateProductUrl
} = require("./productLinks");

const {
    saveStock
} = require("./models/stockModel");

const {
    getBuyableStock
} = require("./utils/stock");

const {
    runWithConcurrency
} = require("./utils/concurrency");

async function processProducts(

    data,

    users,

    stockMap,

    userNotifiedMap,

    sendNotification,

    shouldNotify,

    storeId

) {

    let productsFound = 0;

    if (!data.data) {

        return productsFound;

    }

    for (const product of data.data) {
await saveStock(
    product._id,
    storeId,
    getBuyableStock(product)
);
        const eligibleUsers = users.filter(user =>
            user.products.includes(product.name)
        );

        productsFound += eligibleUsers.length;

        product.url = generateProductUrl(product.name);

        await runWithConcurrency(
            eligibleUsers,
            8,
            async (user) => {

                await shouldNotify(

                    product,

                    stockMap,

                    userNotifiedMap,

                    sendNotification,

                    user.userId,

                    user.chatId,

                    user.pincode,

                    storeId

                );

            }
        );

    }

    return productsFound;

}

module.exports = {

    processProducts

};