const Message = require('../models/Message');
const Chat = require('../models/Chat');

// Fetch messages for a chat
exports.getMessagesByChatId = async (req, res) => {
    const { chatId } = req.params;

    try {
        const messages = await Message.find({ chat: chatId })
            .populate('sender', 'username avatar')
            .sort({ createdAt: 1 });

        res.status(200).json({ messages });
    } catch (error) {
        console.error('getMessagesByChatId error:', error);
        res.status(500).json({ message: 'Failed to fetch messages.' });
    }
};

// Mark a message as read
exports.markMessageAsRead = async (req, res) => {
    const { messageId } = req.params;

    try {
        const message = await Message.findByIdAndUpdate(
            messageId,
            { status: 'read' },
            { new: true }
        );

        res.status(200).json({ message });
    } catch (error) {
        console.error('markMessageAsRead error:', error);
        res.status(500).json({ message: 'Failed to update message status.' });
    }
};