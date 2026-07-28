const {
    generateProductUrl
} = require("./productLinks");

const {
    saveStock
} = require("./models/stockModel");

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
    product.inventory_quantity
);
        for (const user of users) {

            if (!user.products.includes(product.name)) {

                continue;

            }

            productsFound++;

            product.url = generateProductUrl(product.name);

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

    }

    return productsFound;

}

module.exports = {

    processProducts

};