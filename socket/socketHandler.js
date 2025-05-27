const Message = require('../models/Message');
const Chat = require('../models/Chat');
const User = require('../models/User');

const connectedUsers = new Map(); // userId => socketId

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        // Register user
        socket.on('registerUser', (userId) => {
            connectedUsers.set(userId, socket.id);
            console.log(`User ${userId} registered`);
        });

        // Send Message
        socket.on('sendMessage', async ({ senderId, receiverId, content, attachments = [] }) => {
            try {
                let chat = await Chat.findOne({
                    participants: { $all: [senderId, receiverId], $size: 2 }
                });

                if (!chat) {
                    chat = await Chat.create({
                        participants: [senderId, receiverId],
                        messages: []
                    });

                    await User.updateMany(
                        { _id: { $in: [senderId, receiverId] } },
                        { $push: { chats: chat._id } }
                    );
                }

                const message = await Message.create({
                    chat: chat._id,
                    sender: senderId,
                    content,
                    attachments
                });

                chat.messages.push(message._id);
                chat.lastMessage = message._id;
                await chat.save();

                const receiverSocketId = connectedUsers.get(receiverId);
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('receiveMessage', { message, chatId: chat._id });
                }

                socket.emit('messageSent', { message, chatId: chat._id });

            } catch (err) {
                console.error('sendMessage error:', err);
                socket.emit('errorMessage', 'Message failed to send.');
            }
        });

        // Typing indicator
        socket.on('typing', ({ senderId, receiverId }) => {
            const receiverSocketId = connectedUsers.get(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('typing', { senderId });
            }
        });

        socket.on('stopTyping', ({ senderId, receiverId }) => {
            const receiverSocketId = connectedUsers.get(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('stopTyping', { senderId });
            }
        });

        // Read Receipt
        socket.on('messageRead', async ({ messageId, readerId }) => {
            try {
                const message = await Message.findByIdAndUpdate(messageId, { status: 'read' }, { new: true });
                const chat = await Chat.findById(message.chat).populate('participants');

                const otherUser = chat.participants.find(p => p._id.toString() !== readerId);
                const receiverSocketId = connectedUsers.get(otherUser._id.toString());

                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('messageReadReceipt', { messageId, readerId });
                }
            } catch (err) {
                console.error('messageRead error:', err);
            }
        });

        // Send Notification
        socket.on('sendNotification', ({ senderId, receiverId, type, content }) => {
            const receiverSocketId = connectedUsers.get(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('receiveNotification', { senderId, type, content });
            }
        });

        // Disconnect
        socket.on('disconnect', () => {
            for (const [userId, socketId] of connectedUsers.entries()) {
                if (socketId === socket.id) {
                    connectedUsers.delete(userId);
                    console.log(`User ${userId} disconnected`);
                    break;
                }
            }
        });
    });
};
