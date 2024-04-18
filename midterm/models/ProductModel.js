const { db } = require('../config');

class ProductModel {
    static async createOrderRow(total) {
        try {
            const [orderRow] = await db.query('INSERT INTO orders (total) VALUES (?)', [total]);
            console.log(`${orderRow.insertId} created`);
            return orderRow.insertId;
        } catch (error) {
            console.error(error);
        }
    };
    // static async createProductRow(order_id, product_id, price, color_code, size, qty) {
    //     try {
    //         const [productRow] = await db.query('INSERT INTO order_items (order_id, product_id, price, color_code, size, qty) VALUES (?, ?, ?, ?, ?, ?)', [order_id, product_id, price, color_code, size, qty]);
    //         console.log(`${productRow.insertId} created`);
    //     } catch (error) {
    //         console.log(error);
    //     }
    // };
    static async createOrderItemRow(order_id, product_id, price, color_code, size, qty) {
        try {
            const [orderItemRow] = await db.query('INSERT INTO order_items (order_id, product_id, price, color_code, size, qty) VALUES (?, ?, ?, ?, ?, ?)', [order_id, product_id, price, color_code, size, qty]);
            console.log(`${orderItemRow.insertId} created`);
        } catch (error) {
            console.error(error);
        }
    };
    static async createColorRow(code, name) {
        try {
            const [colorRow] = await db.query('SELECT * FROM colors WHERE code = ?', [code]);
            if (colorRow.length === 0) {
                const [colorRow] = await db.query('INSERT INTO colors (code, name) VALUES (?, ?)', [code, name]);
                console.log(`${colorRow.insertId} created`);
            } else {
                console.log(`${colorRow.insertId} already exists`);
            }
        } catch (error) {
            console.error(error);
        }
    };
    static async updateProductQty(product_id, size, qty) {
        try {
            const [productRow] = await db.query('SELECT * FROM products WHERE id = ?', [product_id]);
            if (productRow.length === 0) {
                if (size === 'S') {
                    const [productRow] = await db.query('INSERT INTO products (id, s_qty) VALUES (?, ?)', [product_id, qty]);
                    console.log(`${productRow.insertId} created`);
                } else if (size === 'M') {
                    const [productRow] = await db.query('INSERT INTO products (id, m_qty) VALUES (?, ?)', [product_id, qty]);
                    console.log(`${productRow.insertId} created`);
                } else if (size === 'L') {
                    const [productRow] = await db.query('INSERT INTO products (id, l_qty) VALUES (?, ?)', [product_id, qty]);
                    console.log(`${productRow.insertId} created`);
                }
            } else {
                if (size === 'S') {
                    const [productRow] = await db.query('UPDATE products SET s_qty = s_qty + ? WHERE id = ?', [qty, product_id]);
                    console.log(`${productRow.affectedRows} updated`);
                } else if (size === 'M') {
                    const [productRow] = await db.query('UPDATE products SET m_qty = m_qty + ? WHERE id = ?', [qty, product_id]);
                    console.log(`${productRow.affectedRows} updated`);
                } else if (size === 'L') {
                    const [productRow] = await db.query('UPDATE products SET l_qty = l_qty + ? WHERE id = ?', [qty, product_id]);
                    console.log(`${productRow.affectedRows} updated`);
                }
            }
        } catch (error) {
            console.error(error);
        }
    };
    static async getAllOrders() {
        try {
            const [orders] = await db.query('SELECT * FROM orders');
            console.log('Orders retrieved');
            return orders;
        } catch (error) {
            console.error(error);
        }
    };
    static async updateColorRow(code, qty) {
        try {
            const [colorRow] = await db.query('UPDATE colors SET product_count = product_count + ? WHERE code = ?', [qty, code]);
            console.log(`${colorRow.affectedRows} updated`);
        } catch (error) {
            console.error(error);
        }
    };
    static async getAllColors() {
        try {
            const [colors] = await db.query('SELECT * FROM colors');
            console.log('Colors retrieved');
            return colors;
        } catch (error) {
            console.error(error);
        } 
    };
    static async getAllOrderItems() {
        try {
            const [orderItems] = await db.query('SELECT * FROM order_items');
            console.log('Order items retrieved');
            return orderItems;
        } catch (error) {
            console.error(error);
        }
    };
    static async getAllProducts() {
        try {
            const [products] = await db.query('SELECT * FROM products');
            console.log('Products retrieved');
            return products;
        } catch (error) {
            console.error(error);
        }
    };
}

module.exports = ProductModel;