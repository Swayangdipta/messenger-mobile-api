const Chat = require('../models/Chat');
const User = require('../models/User');
const Message = require('../models/Message');

// Fetch all chats for a user
exports.getUserChats = async (req, res) => {
    try {
        const userId = req.user._id;

        const chats = await Chat.find({ participants: userId })
            .populate('participants', 'username avatar status')
            .populate({
                path: 'lastMessage',
                populate: { path: 'sender', select: 'username' }
            })
            .sort({ updatedAt: -1 });

        res.status(200).json({ chats });
    } catch (error) {
        console.error('getUserChats error:', error);
        res.status(500).json({ message: 'Failed to fetch chats.' });
    }
};

// Fetch chat by participants (used before sending message)
exports.getOrCreateChat = async (req, res) => {
    const { userId1, userId2 } = req.body;
    try {
        let chat = await Chat.findOne({
            participants: { $all: [userId1, userId2], $size: 2 }
        }).populate('messages');

        if (!chat) {
            chat = await Chat.create({ participants: [userId1, userId2] });

            await User.updateMany(
                { _id: { $in: [userId1, userId2] } },
                { $push: { chats: chat._id } }
            );
        }

        res.status(200).json(chat);
    } catch (error) {
        console.error('getOrCreateChat error:', error);
        res.status(500).json({ message: 'Failed to get/create chat.' });
    }
};