const express = require('express');
const swaggerUi = require('swagger-ui-express');
const yaml = require('yamljs');
const productRouter = require('./routes/productRouter');
const userRouter = require('./routes/userRouter');
const orderRouter = require('./routes/orderRouter');
const cors = require('cors');
// const authRouter = require('./routes/authRouter');

const app = express();

app.use(cors());

const swaggerDocument = yaml.load('./docs/stylish_api.yaml');

app.get('/healthcheck', (req, res) => {
    res.send('ok');
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// app.use('/api/1.0/auth', authRouter);

app.use('/api/1.0/order', orderRouter);

app.use('/api/1.0/products', productRouter);

app.use('/api/1.0/user', userRouter);

app.use('/admin', express.static('views'));

app.listen(3000, () => {
    console.log('App listening on port 3000');
});