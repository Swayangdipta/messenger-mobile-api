const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User
            .findOne({ email })

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '48h'
        });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            maxAge: 48 * 60 * 60 * 1000 // 48 hours
        });

        res.status(200).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                status: user.status
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.register = async (req, res) => {
    const { username, email, password, avatar } = req.body;

    try {
        const existingUser = await User.find({ email });

        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            avatar, // Set a default avatar
            status: 'offline' // Default status
        });

        await newUser.save();

        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
            expiresIn: '48h'
        });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            maxAge: 48 * 60 * 60 * 1000 // 48 hours
        });

        res.status(201).json({
            token,
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                avatar: newUser.avatar,
                status: newUser.status
            }
        });

    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.logout = (req, res) => {
    // Invalidate the token on the client side
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' // Use secure cookies in production
    });
    res.status(200).json({ message: 'Logged out successfully' });
}