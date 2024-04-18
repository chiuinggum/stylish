const { db } = require('../config');

class PaymentModel {
    static async createPaymentRecord(order_id, payment) {
        console.log(payment);
        console.log(order_id);
        const {
            rec_trade_id,
            bank_transaction_id,
            amount,
            currency,
            transaction_time_millis,
            bank_transaction_time,
            instalment_info = null,
            redeem_info = null
        } = payment;
        try {
            // const query = 'INSERT INTO payments (order_id, rec_trade_id, bank_transaction_id, amount, currency, transaction_time_millis, bank_transaction_time, instalment_info, redeem_info) VALUES (?, ?, ?, ?, ?, ?, JSON_OBJECT("start_time_millis", ?, "end_time_millis", ?), ?, ?)';
            const query = `
                INSERT INTO payments (
                    order_id, 
                    rec_trade_id, 
                    bank_transaction_id, 
                    amount, 
                    currency, 
                    transaction_time_millis, 
                    bank_transaction_time, 
                    instalment_info, 
                    redeem_info
                ) VALUES (?, ?, ?, ?, ?, ?, JSON_OBJECT("start_time_millis", ?, "end_time_millis", ?), ?, ?)
            `;
            const values = [
                order_id,
                rec_trade_id,
                bank_transaction_id,
                amount,
                currency,
                transaction_time_millis,
                bank_transaction_time.start_time_millis,  // Assuming these values are obtained from your JSON
                bank_transaction_time.end_time_millis,    // object correctly
                instalment_info,
                redeem_info
            ];
            const [paymentRow] = await db.query(query, values);
            console.log(`payment inserted: ${order_id}`);
        } catch(err) {
            console.error(err);
            throw new Error('Error inserting payment');
        }
    }
};

module.exports = PaymentModel;