const { db } = require('../config');
const jwt = require('jsonwebtoken');

class UserModel {
    static async createUser(user, picture, provider = 'native') {
        const { name, email, password } = user;
        if(!picture){
            picture = 'null';
        }
        try {
            const [userRow] = await db.query('INSERT INTO users (provider, name, email, password, picture) VALUES (?, ?, ?, ?, ?)', [provider, name, email, password, picture]);
            console.log(`inserted: ${userRow.insertId}, ${name}`);
            return userRow.insertId;
        } catch(err) {
            throw new Error('Error inserting user');
        }
    };
    static async getUserByEmail(email) {
        try {
            const [userRow] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
            if(userRow.length === 0) {
                throw new Error('No user found');
            }
            return userRow[0];
        } catch(err) {
            throw err;
        }
    };
    static async countUserByEmail(email) {
        try {
            const [userRow] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
            return userRow.length;
        } catch(err) {
            throw err;
        }
    };
    static async formSignData(user) {
        const { id, provider, name, email, picture } = user;
        const payload = { id, provider, name, email, picture };
        const access_token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
        return {
            access_token,
            access_expired: process.env.JWT_EXPIRES_IN,
            user: {
                id,
                provider,
                name,
                email,
                picture
            }
        };
    }
};

module.exports = UserModel;