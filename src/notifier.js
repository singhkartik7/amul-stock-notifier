
const {
    saveUserNotifiedStock
} = require("./models/userNotificationModel");

async function shouldNotify(

    product,

    stockMap,

    userNotifiedMap,

    sendNotification,

    userId,

    chatId,

    pincode,

    storeId

) {

    const key =
        `${storeId}|${product._id}`;
const userKey =
    `${userId}|${product._id}|${storeId}`;

    const isBuyable =
        Number(product.available) === 1 &&
        (
            product.inventory_low_stock_quantity === undefined ||
            product.inventory_quantity >= product.inventory_low_stock_quantity
        );

    const currentStock =
        isBuyable
            ? product.inventory_quantity
            : 0;

    const previousStock =
        stockMap.has(key)
            ? stockMap.get(key)
            : 0;
            const previousUserStock =
    userNotifiedMap.has(userKey)
        ? userNotifiedMap.get(userKey)
        : 0;

if (

    currentStock > 0 &&
    currentStock !== previousUserStock

) {

    await sendNotification(

        chatId,

        product,

        pincode

    );

    userNotifiedMap.set(
        userKey,
        currentStock
    );

    await saveUserNotifiedStock(

        userId,

        product._id,

        storeId,

        currentStock

    );

}
else if (

    currentStock === 0 &&
    previousUserStock !== 0

) {

    userNotifiedMap.set(
        userKey,
        0
    );

    await saveUserNotifiedStock(

        userId,

        product._id,

        storeId,

        0

    );

}
   stockMap.set(
    key,
    currentStock
);

}

module.exports = {

    shouldNotify

};