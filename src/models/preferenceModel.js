const pool = require("../database/db");
const {
    lookupStoreIdByPincode
} = require("../services/pincodeLookupService");
const {
    getSessionCache,
    getStoreMapCache
} = require("../services/cacheService");



async function getPreferenceByUserId(userId) {

    const result = await pool.query(

        `SELECT * FROM preferences
         WHERE user_id = $1`,

        [userId]

    );

    return result.rows[0];

}

async function savePreference(
    userId,
    pincode,
    chatId = null
) {
 let storeId = null;

    if (pincode) {

        

        const storeMap = getStoreMapCache();
const store = await lookupStoreIdByPincode(
    pincode
);

        storeId = store.storeId;

    }

    const existing =
        await getPreferenceByUserId(userId);

    if (existing) {

        await pool.query(

            `UPDATE preferences

            SET pincode = $1,
    store_id = $2,
    chat_id = $3


             WHERE user_id = $4`,

            [
    pincode,
    storeId,
    chatId,
    userId
]

        );

        return await getPreferenceByUserId(
            userId
        );

    }

    const result = await pool.query(

        `INSERT INTO preferences

       (user_id, pincode, store_id, chat_id)

VALUES ($1,$2,$3,$4)

        RETURNING *`,

       [
    userId,
    pincode,
    storeId,
    chatId
]

    );

    return result.rows[0];

}

async function updateChatId(
    userId,
    chatId
) {

    await pool.query(

        `UPDATE preferences

         SET chat_id = $1

         WHERE user_id = $2`,

        [
            chatId,
            userId
        ]

    );

}

async function deletePreference(userId) {

    await pool.query(

        `DELETE FROM preferences

         WHERE user_id = $1`,

        [userId]

    );

}

async function getAllPreferences() {

    const result = await pool.query(`

        SELECT

            users.email,

            preferences.id,

            preferences.pincode,

            preferences.chat_id

        FROM preferences

        JOIN users

        ON preferences.user_id = users.id

    `);

    return result.rows;

}

async function getGroupedPreferences() {

    const result = await pool.query(`
SELECT

    preferences.user_id,

    preferences.store_id,

    preferences.pincode,

    preferences.chat_id,

    preferences.notify_until,

    users.email,

    products.product_name
    
FROM preferences

JOIN users
    ON users.id = preferences.user_id

LEFT JOIN tracked_products
    ON tracked_products.preference_id = preferences.id

LEFT JOIN products
    ON products.id = tracked_products.product_id

WHERE preferences.chat_id IS NOT NULL
AND preferences.store_id IS NOT NULL

ORDER BY preferences.store_id

    `);

    const grouped = {};

for (const row of result.rows) {

    if (!grouped[row.store_id]) {

        grouped[row.store_id] = {

    users: []

};

    }

    let user = grouped[row.store_id].users.find(

        u => u.email === row.email

    );

    if (!user) {

       user = {
    userId: row.user_id,
    email: row.email,
    chatId: row.chat_id,
    pincode: row.pincode,
    notifyUntil: row.notify_until,
    products: []
};

        grouped[row.store_id].users.push(user);

    }

    if (row.product_name) {

        user.products.push(row.product_name);

    }

}

return grouped;

}

async function updateNotifyUntil(userId, notifyUntil) {

    await pool.query(

        `UPDATE preferences

         SET notify_until = $1

         WHERE user_id = $2`,

        [

            notifyUntil,

            userId

        ]

    );

}

async function stopNotifications(userId) {

    await pool.query(

        `UPDATE preferences

         SET notify_until = NULL

         WHERE user_id = $1`,

        [

            userId

        ]

    );

}
async function disableTelegram(chatId) {

    await pool.query(

        `UPDATE preferences

         SET chat_id = NULL

         WHERE chat_id = $1`,

        [chatId]

    );

}

module.exports = {

    getPreferenceByUserId,

    savePreference,

    updateChatId,

    deletePreference,

    getAllPreferences,

    getGroupedPreferences,

    updateNotifyUntil,

    stopNotifications,

    disableTelegram

};