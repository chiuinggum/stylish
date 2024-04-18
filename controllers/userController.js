const { multerUpload } = require('../config');
const { createUser, getUserByEmail, countUserByEmail, formSignData } = require('../models/UserModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


class UserController {
    static async checkContentTypeHeader(req, res, next) {
        const header = req.get('Content-Type');
        if (!header || header !== 'application/json') {
            return res.status(400).json({ error: 'Content-Type must be application/json' });
        }
        next();
    };
    static async checkRegex(req, res, next) {
        const { email, password } = req.body;

        const passwordRegex = [/[A-Z]/, /[a-z]/, /[0-9]/, /[~`!@#$%^&*()_\-+={[}\]|:;"'<,>.?/|]/];
        const typesCount = passwordRegex.filter(regex => regex.test(password)).length;
        if (typesCount < 3) {
            return res.status(400).json({ error: 'Password not strong enough.' });
        }
    
        const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Email not in the right form.' });
        }
        next();
    };
    static async checkIfEmailAlreadyExists(req, res, next) {
        const { email } = req.body;
        try {
            const emailCount = await countUserByEmail(email);
            if(emailCount > 0) {
                return res.status(409).json({ error:'email already exists' });
            }
            next();
        } catch(err) {
            console.error(err);
            return res.status(500).json({ error:'error querying the database' });
        }
    };
    static async uploadProfileImage(req, res, next) {
        const upload = multerUpload.single('picture');
        upload(req, res, (err) => {
            if(err) {
                return res.status(500).json({ error: 'Error uploading profile image' });
            }
            console.log('profile image uploaded');
            next();
        });
    };
    static async hashPassword(req, res, next) {
        const { password } = req.body;
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            req.body.password = hashedPassword;
            next();
        } catch(err) {
            return res.status(500).json({ error:'error hashing password' });
        }
    };
    static async checkAuthorizationHeader(req, res, next) {
        const authHeader = req.get('Authorization');
        if(!authHeader || authHeader.split(' ')[0] !== 'Bearer') {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        next();
    };
    static async userSignUp(req, res, next) {
        const { name, email } = req.body;
        const picture = req.file || null;
        try {
            const id = await createUser(req.body, picture);
            const payload = { id, provider: 'native', name, email, picture };
            const access_token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
            res.status(200).json({
               data: {
                access_token,
                access_expired: process.env.JWT_EXPIRES_IN,
                user: {
                    id,
                    provider: 'native',
                    name,
                    email,
                    picture
                }
               }
            });
            next();
        } catch(err) {
            console.error(err);
            res.status(500).json({ error: 'Error signing up' });
        }
    };
    static async authenticateEmailAndPassword(req, res) {
        const { email, password } = req.body;
        try {
            const user = await getUserByEmail(email);
            const isPasswordCorrect = await bcrypt.compare(password, user.password);
            if(!isPasswordCorrect) {
                console.log('incorrect password');
                return res.status(403).json({ error: 'Incorrect password' });
            }
            req.user = user;
            console.log('correct password');
        } catch(err) {
            console.error(err);
            res.status(500).json({ error: 'Error signing in' });
        }
    };
    static async verifyToken(req, res) {
        const { access_token } = req.body;
        try {
            jwt.verify(access_token, process.env.JWT_SECRET, (err, decoded) => {
                if(err) return res.status(403).json({ error: 'Invalid access token' });
                req.user = decoded;
            });
        } catch(err) {
            console.error(err);
            res.status(500).json({ error: 'Error verifying token' });
        }
    }
    // static async verifyGoogleToken(req, res ,next) {

    // };
    static async userSignIn(req, res, next) {
        const { provider } = req.body;
        try {
            if(provider === 'native') {
                await UserController.authenticateEmailAndPassword(req, res);
            } else if(provider === 'facebook') {
                await UserController.verifyToken(req, res);
            } else if(provider === 'google') {

            }
            const data = await formSignData(req.user);
            // localStorage.setItem('access_token', data.access_token);
            res.status(200).json({ data: data });
            next();
        } catch(err) {
            console.error(err);
            res.status(500).json({ error: 'Error signing in' });
        }
    };
    static async checkAuthHeader(req, res, next) {
        const authHeader = req.get('Authorization');
        if(!authHeader || authHeader.split(' ')[0] !== 'Bearer') {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        next();
    };
    static async getUserProfile(req, res, next) {
        try {
            const authHeader = req.get('Authorization');
            const access_token = authHeader.split(' ')[1];
            const decode = jwt.verify(access_token, process.env.JWT_SECRET);
            const { provider, name, email, picture } = decode;
            res.status(200).json({
                data:{
                    provider,
                    name,
                    email,
                    picture
                }
            });
        } catch(err) {
            console.error(err);
            res.status(500).json({ error: 'Error getting user profile' });
        }
    };
};

module.exports = UserController;