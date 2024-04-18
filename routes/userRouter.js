const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const { checkContentTypeHeader, checkRegex, checkIfEmailAlreadyExists, uploadProfileImage, hashPassword, userSignUp, userSignIn, checkAuthHeader, getUserProfile, userSignInTest } = require('../controllers/userController');

router.use(bodyParser.json());
router.post('/signup', checkContentTypeHeader, checkRegex, checkIfEmailAlreadyExists, uploadProfileImage, hashPassword, userSignUp);
router.use('/signin', express.static('views'));
router.post('/signin', userSignIn);
router.get('/profile', checkAuthHeader, getUserProfile);

module.exports = router;