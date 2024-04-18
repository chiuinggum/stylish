const { db } = require('../config');
const { getVariantByProductIdColorCodeAndSize } = require('./VariantModel');

class OrderModel {
    static async createOrderRecord(order, user_id) {
        const { shipping, payment, subtotal, freight, total, recipient } = order;
        const { name, phone, email, address, time } = recipient;
        console.log(shipping, payment, subtotal, freight, total, name, phone, email, address, time);
        try {
            const query = 'INSERT INTO orders (user_id, shipping, payment, subtotal, freight, total, recipient_name, recipient_phone, recipient_email, recipient_address, recipient_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
            const values = [user_id, shipping, payment, subtotal, freight, total, name, phone, email, address, time];
            console.log('hi');
            const [orderRow] = await db.query(query, values);
            console.log(`order inserted: ${orderRow.insertId}`);
            return orderRow.insertId;
        } catch(err) {
            throw new Error('Error inserting order');
        }
    };
    static async createOrderItemsRecord(list, order_id) {
        try {
            for(let item of list) {
                const { id, color, size, qty } = item;
                const variant = await getVariantByProductIdColorCodeAndSize(id, color.code, size);
                const variant_id = variant.id;
                const [orderProductRow] = await db.query('INSERT INTO order_items (order_id, variant_id, quantity) VALUES (?, ?, ?)', [order_id, variant_id, qty]);
                console.log(`order product inserted: ${orderProductRow.insertId}`);
            }
        } catch(err) {
            throw new Error('Error inserting order product');
        }
    };
    static async updateOrderPaidById(order_id) {
        try {
            const [orderRow] = await db.query('UPDATE orders SET paid = ? WHERE id = ?', [true, order_id]);
            if(orderRow.affectedRows === 0) {
                throw new Error('Order not found');
            }
            console.log(`paid: ${order_id}`);
        } catch(err) {
            throw err;
        }
    };
};

module.exports = OrderModel;