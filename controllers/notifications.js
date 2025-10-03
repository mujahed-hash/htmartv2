// const  sendNotification  = require('../app');
const socketIo = require('socket.io');
const connectedUsers = new Map();
const Notification = require('../database/models/notification');
const asyncHandler = require('express-async-handler');

// Example function to send a notification
// Inside your notifications logic, whenever a new notification is created:
const sendNotification = (userId, notification) => {
    const socketId = connectedUsers.get(userId);
    if (socketId) {
        io.to(socketId).emit('notification', notification); // Send notification to a specific user
    }
};

// Mark all notifications as admin read (Admin-specific)
const markAllAsAdminRead = asyncHandler(async (req, res) => {
    const result = await Notification.updateMany({ userId: req.userId, isRead: false }, { isRead: true });
    res.status(200).json({ message: 'All notifications marked as read.', modifiedCount: result.modifiedCount });
});
// Get unread notification count (Admin and user-specific)
const getAdminUnreadNotificationCount = asyncHandler(async (req, res) => {
    let unreadCount;

    // Admin counts their own notifications where isRead is false
    unreadCount = await Notification.countDocuments({ userId: req.userId, isRead: false });

    res.status(200).json({ unreadCount });
});

module.exports = {
    getAdminUnreadNotificationCount,
    
    markAllAsAdminRead,
};
exports.triggerNotification = async (req, res) => {
    const { userId, message } = req.body;

    // Example notification payload
    const notification = {
        message,
        timestamp: new Date(),
    };
        // Emit a notification update to the user after it's created
        sendNotification(req.userId, {
            // type: newNotification.type,
            message: notification.message,
        });

    // Emit the notification via WebSocket
    sendNotification.sendNotification(userId, notification);

            // Also, update the unread count in real-time via Socket
            const unreadCount = await Notification.countDocuments({
                userId: req.userId,
                isRead: false,
            });
    
            io.to(socketId).emit('unreadCountUpdate', unreadCount); // Push unread count update
    
    
    res.json({ message: 'Notification sent' });
};

