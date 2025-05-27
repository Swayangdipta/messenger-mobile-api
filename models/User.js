const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        required: true
    },
    chats: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat'
    }],
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    friendRequests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    blockedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    notifications: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Notification'
    }],
    lastSeen: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['online', 'offline', 'away', 'busy'],
        default: 'offline'
    },
    bio: {
        type: String,
        default: ''
    }
},{timestamps: true})

module.exports = mongoose.model('User', userSchema)