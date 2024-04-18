const axios = require('axios');
const {
    createOrderRow,
    createProductRow,
    createColorRow,
    getAllOrders,
    updateColorRow,
    getAllColors,
    getAllProducts,
    getAllOrderItems,
    updateProductQty,
    createOrderItemRow
} = require('../models/ProductModel');
const { db } = require('../config');
const { updateData } = require('../socket');

class ProductController {
    static async getAndStoreData(req, res, next) {
        // const connection = await db.getConnection();
        try {
            const response = await axios.get('http://35.75.145.100:1234/api/1.0/order/data');
            const data = response.data;

            // await connection.beginTransaction();

            for (let order of data) {
                const order_id = await createOrderRow(order.total);
                for (let order_item of order.list) {
                    await createColorRow(order_item.color.code, order_item.color.name);
                    await updateColorRow(order_item.color.code, order_item.qty);
                    await updateProductQty(order_item.id, order_item.size, order_item.qty);
                    await createOrderItemRow(order_id, order_item.id, order_item.price, order_item.color.code, order_item.size, order_item.qty)
                }
            }

            // await connection.commit();

            res.status(200).json({ message: 'Data fetched and stored' })
            next();
        } catch (error) {
            console.log(error);
            // await connection.rollback();
            // connection.release();
            res.status(500).send('Internal server error');
        }
    };
    static async getTotalRevenue(req, res, next) {
        try {
            const orders = await getAllOrders();
            let totalRevenue = 0;
            for (let order of orders) {
                totalRevenue += order.total;
            }
            res.status(200).json({ "total_revenue": totalRevenue });
            next();
        } catch (error) {
            console.log(error);
            res.status(500).send('Internal server error');
        }
    };
    static async getColorPercentage(req, res, next) {
        try {
            const colors = await getAllColors();
            let totalProducts = 0;
            for (let color of colors) {
                totalProducts += color.product_count;
            }
            let colorPercentage = [];
            for (let color of colors) {
                colorPercentage.push({
                    "name": color.name,
                    "code": color.code,
                    "product_count": color.product_count,
                    "percentage": (color.product_count / totalProducts) * 100
                });
            }
            res.status(200).json(colorPercentage);
            next();
        } catch (error) {
            console.log(error);
            res.status(500).send('Internal server error');
        }
    };
    static async getProducts(req, res, next) {
        try {
            const products = await getAllOrderItems();
            let productQuantity = [];
            for (let product of products) {
                productQuantity.push({
                    "price": product.price,
                    "qty": product.qty
                });
            }
            res.status(200).json(productQuantity);
            next();
        } catch (error) {
            console.log(error);
            res.status(500).send('Internal server error');
        }
    };
    static async getTopFiveProducts(req, res, next) {
        try {
            const products = await getAllProducts();
            const productSums = products.map((product) => {
                return {
                    "id": product.id,
                    "s_qty": product.s_qty,
                    "m_qty": product.m_qty,
                    "l_qty": product.l_qty,
                    "qty": product.s_qty + product.m_qty + product.l_qty
                }
            })
            const sortedProducts = productSums.sort((a, b) => b.qty - a.qty);
            const topFiveProducts = sortedProducts.slice(0, 5);
            res.status(200).json(topFiveProducts);
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal server error');
        }
    };
    static async createOrder(req, res, next, io) {
        try {
            console.log(req.body);
            const { total, list } = req.body;
            const order_id = await createOrderRow(total);
            for (let order_item of list) {
                await createColorRow(order_item.color.code, order_item.color.name);
                    await updateColorRow(order_item.color.code, order_item.qty);
                    await updateProductQty(order_item.id, order_item.size, order_item.qty);
                    await createOrderItemRow(order_id, order_item.id, order_item.price, order_item.color.code, order_item.size, order_item.qty)
            }
            updateData(io);
            res.status(200).json({ message: 'Order created' });
            next();
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal server error');
        }
    }
}

module.exports = ProductController;