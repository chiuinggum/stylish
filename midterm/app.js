const express = require('express');
const { createServer } = require("http");
const { Server } = require('socket.io');
const cors = require('cors');
const {
    getAndStoreData,
    getTotalRevenue,
    getColorPercentage,
    getProducts,
    getTopFiveProducts,
    createOrder
} = require('./controllers/ProductController');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(cors());
app.use(express.json());

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

app.get('/healthcheck', (req, res) => {
    res.send('midterm app running');
});

app.post('/checkout', (req, res, next) => createOrder(req, res, next, io));
app.get('/fetch', getAndStoreData);
app.get('/total-revenue', getTotalRevenue);
app.get('/color-percentage', getColorPercentage);
app.get('/product-price', getProducts);
app.get('/top-five', getTopFiveProducts);

app.use('/admin', express.static('views'));

httpServer.listen(3333, () => {
    console.log('midterm app listening on port 3333');
});