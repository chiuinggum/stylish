const { createPaymentRecord } = require('../models/PaymentModel');

class PaymentController {
    static async sendToTappayServer(req, res) {
        const { body } = req;
        try {
            const response = await fetch('https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': 'partner_PHgswvYEk4QY6oy3n8X3CwiQCVQmv91ZcFoD5VrkGFXo8N7BFiLUxzeG',
                },
                body: JSON.stringify(body)
            });
            const responseBody = await response.json();
            return res.status(200).json(responseBody);
        } catch(err) {
            console.error(err);
            return res.status(500).json({ error: 'error sending to tappay server' });
        }
    }
    static async createPayment(req, res) {
        const { order_id, payment } = req.body;
        try {
            const payment_id = await createPaymentRecord(order_id, payment);
            res.status(200).json({
                data: {
                    number: payment_id
                }
            });
        } catch(err) {
            console.error(err);
            return res.status(500).json({ error: 'error creating payment' });
        }
    };
};

module.exports = PaymentController;