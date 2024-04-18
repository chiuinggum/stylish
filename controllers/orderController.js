const { db } = require('../config');
const jwt = require('jsonwebtoken');
const { createOrderItemsRecord, createOrderRecord, updateOrderPaidById,  } = require('../models/OrderModel');

class OrderController {
    static async checkContentTypeHeader(req, res, next) {
        const header = req.get('Content-Type');
        if (!header || header !== 'application/json') {
            return res.status(400).json({ error: 'Content-Type must be application/json' });
        }
        console.log('Content-Type header checked');
        next();
    };
    static async checkAuthorizationHeader(req, res, next) {
        const authHeader = req.get('Authorization');
        console.log(authHeader);
        if(!authHeader || authHeader.split(' ')[0] !== 'Bearer') {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        console.log('Authorization header checked');
        next();
    };
    static async verifyToken(req, res, next) {
        const token = req.get('Authorization').split(' ')[1];
        console.log(token);
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch(err) {
            console.error(err);
            res.status(500).json({ error: 'error verifying token' });
        }
    };
    static async createOrder(req, res) {
        console.log(req.body);
        const { order } = req.body;
        const { list } = order;
        const user_id = req.user.id;
        let connection;
        try {
            connection = await db.getConnection();
            await connection.beginTransaction();

            const order_id = await createOrderRecord(order, user_id);
            await createOrderItemsRecord(list, order_id);

            await connection.commit();
            connection.release();
            req.order_id = order_id;
            res.status(200).json({
                data: {
                    number: order_id
                }
            });
        } catch(err) {
            if (connection) {
                await connection.rollback();
                connection.release();
            }
            console.error(err);
            return res.status(500).json({ error: 'error creating order' });
        }
    };
    
    /* ================================================= */
    
    static async makeOrderPaid(req, res, next) {
        const { order_id } = req.body;
        try {
            await updateOrderPaidById(order_id);
            console.log('order paid');
            next();
        } catch(err) {
            console.error(err);
            return res.status(500).json({ error: 'error making order paid' });
        }
    };
};

module.exports = OrderController;