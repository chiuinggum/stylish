const mysql = require('mysql2/promise');
require('dotenv').config();

const config = {
    db: mysql.createPool({
        host: process.env.DB_HOST,
        // host: '127.0.0.1',
        // port: '3306',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE
    })
};

module.exports = config;