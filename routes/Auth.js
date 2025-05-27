const router = require('express').Router();

const { register, login, logout } = require('../controllers/Auth');
const { isSignedIn, isAuthenticated } = require('../middlewares/Auth');

// Register route
router.post('/register', register);
// Login route
router.post('/login', login);
// Logout route
router.post('/logout', isSignedIn, isAuthenticated, logout);

module.exports = router;