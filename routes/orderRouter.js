const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const { checkContentTypeHeader, checkAuthorizationHeader, createOrder, verifyToken, makeOrderPaid } = require('../controllers/orderController');
const { createPayment, sendToTappayServer } = require('../controllers/paymentController');

router.use(bodyParser.json());
router.post('/checkout', checkContentTypeHeader, checkAuthorizationHeader, verifyToken, createOrder);
router.post('/tappay', sendToTappayServer);
router.post('/pay', makeOrderPaid, createPayment);

module.exports = router;