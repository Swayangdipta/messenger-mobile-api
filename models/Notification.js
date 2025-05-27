const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['message', 'friend-request', 'info', 'system'],
        required: true
    },
    content: {
        type: String
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);