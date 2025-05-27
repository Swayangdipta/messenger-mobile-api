const {expressjwt} = require('express-jwt');
const User = require('../models/User');

exports.isSignedIn = expressjwt({
    secret: process.env.JWT_SECRET,
    algorithms: ['HS256'],
    userProperty: 'auth',
    getToken: (req) => {
        if (req.cookies && req.cookies.token) {
            return req.cookies.token;
        }
        return null;
    }
});

exports.isAuthenticated = (req, res, next) => {
    const user = req.auth;
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    User.findById(user._id)
        .then((foundUser) => {
            if (!foundUser) {
                return res.status(404).json({ message: 'User not found' });
            }
            req.profile = foundUser;
            next();
        })
        .catch((err) => {
            console.error('Authentication error:', err);
            res.status(500).json({ message: 'Server error' });
        });
};

exports.isAdmin = (req, res, next) => {
    if (req.profile.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }
    next();
};