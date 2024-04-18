const express = require('express');
const router = express.Router();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const LineStrategy = require('passport-line').Strategy; //
const session = require('express-session');

let data = {};

router.use(session({
    resave: false,
    saveUninitialized: false,
    secret: 'SECRET'
}));
router.use(passport.initialize());
router.use(passport.session());

passport.serializeUser((user, cb) => cb(null, user));
passport.deserializeUser((obj, cb) => cb(null, obj));

passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        scope: ['profile', 'email'],
        state: true
    },
    async (accessToken, refreshToken, profile, done) => {
        data.access_token = accessToken;
        try {
            const response = await fetch ('https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=' + accessToken);
            if(response.ok) {
                const info = await response.json();
                console.log(info);
                // data.access_expired = info.expires_in;
            } else {
                console.error('error getting user info');
            }
        } catch(err) {
            console.error(err);
        }
        data.user = profile;
        return done(null, profile);
    }
));

passport.use(new LineStrategy({
    channelID: process.env.LINE_CHANNEL_ID,
    channelSecret: process.env.LINE_CHANNEL_SECRET,
    callbackURL: process.env.LINE_CALLBACK_URL,
    scope: ['profile', 'openid', 'email'],
    },
    (accessToken, refreshToken, profile, done) => {
        data.accessToken = accessToken;
        data.user = profile;
        console.log(profile.email);
        // console.log(accessToken);        
        return done(null, profile);
    }
));

// Google
router.get('/', (req, res) => {
    res.send('<a href="/api/1.0/auth/google">Authenticate with Google</a><br/><a href="/api/1.0/auth/line">Authenticate with LINE</a>');

})

// Google
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/api/1.0/auth/error' }),
    (req, res) => {
        res.redirect('/api/1.0/auth/success');
    }
);

// Line
// router.get('/', (req, res) => {
//     res.send('<a href="/api/1.0/auth/line">Authenticate with LINE</a>');
// })
router.get('/line', passport.authenticate('line'));
router.get('/line/callback',
    passport.authenticate('line', { failureRedirect: '/api/1.0/auth/error' }),
    (req, res) => {
        res.redirect('/api/1.0/auth/success');
    }
);

router.get('/success', (req, res) => {
    const { access_token, access_expired, user } = data;
    const { id, provider, displayName, email, picture } = user;
    res.status(200).json({
        data: {
            access_token,
            access_expired,
            user: {
                id,
                provider,
                name: displayName,
                email,
                picture
            }
        }
    });
});

router.get('/error', (req, res) => res.send("error logging in"));

module.exports = router;