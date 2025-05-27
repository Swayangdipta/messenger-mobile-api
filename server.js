const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
const {connectDB} = require('./config/db'); // your MongoDB connection

// Routes
const authRoutes = require('./routes/Auth');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Connect DB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);

// Default route
app.get('/server/status', (req, res) => {
    try {
        res.status(200).json({status: 'ok'});
    } catch (error) {
        res.status(500).json({status: 'down', error: error.message});
    }
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});

// Self ping for keeping the server alive
app.get('/ping', (req, res) => {
    res.status(200).send('pong');
});

setInterval(() => {
    http.get(process.env.SELF_URL+'/ping', (res) => {
        if (res.statusCode === 200) {
            console.log('Server is alive');
        } else {
            console.error('Server is down');
        }
    }).on('error', (err) => {
        console.error('Error pinging server:', err);
    });
}, 600000); // Ping every 5 minutes

// Handle unhandled rejections
process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

// Handle SIGINT for graceful shutdown
process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
});

// Handle SIGTERM for graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
});


// Socket setup
const socketHandler = require('./socket/socketHandler');
socketHandler(io);

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
