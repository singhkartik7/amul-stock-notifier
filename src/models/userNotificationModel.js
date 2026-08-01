const pool = require("../database/db");

async function loadUserNotifiedMap() {
    const result = await pool.query(`
        SELECT user_id, product_id, store_id, last_notified_stock
        FROM user_notified_stock
    `);

    const map = new Map();

    for (const row of result.rows) {
        const key = `${row.user_id}|${row.product_id}|${row.store_id}`;
        map.set(key, row.last_notified_stock);
    }

    return map;
}

async function saveUserNotifiedStock(
    userId,
    productId,
    storeId,
    stock
) {
    await pool.query(
        `
        INSERT INTO user_notified_stock
        (user_id, product_id, store_id, last_notified_stock)
        VALUES ($1,$2,$3,$4)

        ON CONFLICT (user_id, product_id, store_id)

        DO UPDATE SET
            last_notified_stock = EXCLUDED.last_notified_stock,
            updated_at = CURRENT_TIMESTAMP
        `,
        [userId, productId, storeId, stock]
    );
}

module.exports = {
    loadUserNotifiedMap,
    saveUserNotifiedStock
};