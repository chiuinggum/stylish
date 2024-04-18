const mysql = require('mysql2/promise');
const multer = require('multer');
require('dotenv').config();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(null, `${file.originalname}-${Date.now()}.jpg`);
    }
});

const config = {
    multerUpload: multer({ storage: storage }),
    db: mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE
    })
};

module.exports = config;