function getBuyableStock(product) {

    const isBuyable =
        Number(product.available) === 1 &&
        (
            product.inventory_low_stock_quantity === undefined ||
            product.inventory_quantity >= product.inventory_low_stock_quantity
        );

    return isBuyable
        ? product.inventory_quantity
        : 0;

}

module.exports = {
    getBuyableStock
};
