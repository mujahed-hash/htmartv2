const express = require('express');
const router = express.Router();
const middleware = require('../helper/middleware');
const roleMiddleware = require('../helper/roles')
const asyncHandler = require('express-async-handler');

const Notification = require('../database/models/notification');
const notificationsController = require('../controllers/notifications');

router.use(middleware.verifyToken);
router.get('/notifications',async(req,res)=>{
    try {
        console.log('Backend: Fetching notifications for userId:', req.userId);
        console.log('Backend: Pagination params - start:', req.query.start, 'limit:', req.query.limit);

        const start = parseInt(req.query.start) || 0;
        const limit = parseInt(req.query.limit) || 20;

        console.log('Backend: Querying notifications for userId:', req.userId, 'typeof:', typeof req.userId);

        // Debug: Check if any notifications exist at all
        const allNotificationsCount = await Notification.countDocuments({});
        console.log('Backend: Total notifications in DB:', allNotificationsCount);

        const notifications = await Notification.find({userId: req.userId}).sort({date:-1}).populate({
            path:'userId',
            select:'name'
        }).skip(start).limit(limit);

        const totalNotifications = await Notification.countDocuments({userId: req.userId});

        console.log('Backend: Query results - notifications.length:', notifications.length, 'totalNotifications:', totalNotifications);

        console.log('Backend: Found notifications:', notifications.length, 'Total:', totalNotifications);
        console.log('Backend: Notifications data:', notifications);

        res.status(200).json({
            totalNotifications,
            notifications
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications.', error });
    }
})

// Get unread count for the authenticated user
router.get('/count/unread-count', async (req, res) => {
    try {
        const unreadCount = await Notification.countDocuments({ userId: req.userId, isRead: false });
        res.status(200).json(unreadCount );
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch unread count' });
    }
});

// Mark all notifications as read
router.put('/mark-all-read', async (req, res) => {
    try {
        const result = await Notification.updateMany({ userId: req.userId, isRead: false }, { isRead: true });
        res.status(200).json({ message: 'All notifications marked as read', modifiedCount: result.nModified });
    } catch (error) {
        res.status(500).json({ error: 'Failed to mark notifications as read' });
    }
});

router.get('/admin/noitifications',middleware.verifyToken, roleMiddleware('isAdmin'), async(req,res)=>{
    try {
        const start = parseInt(req.query.start) || 0;
        const limit = parseInt(req.query.limit) || 20;
        const notifications = await Notification.find({ userId: req.userId }).sort({date:-1}).populate({
            path:'userId',
            select:'name'
        }).skip(start).limit(limit);

        const totalNotifications = await Notification.countDocuments({userId: req.userId});

        res.status(200).json({
            totalNotifications,
            notifications
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching admin notifications.', error });
    }
})

router.post('/notifications', asyncHandler(notificationsController.triggerNotification));

// Mark all notifications as read for admin
router.put('/admin/mark-all-read',middleware.verifyToken ,roleMiddleware('isAdmin'), notificationsController.markAllAsAdminRead);

// Get unread notification count for admin
router.get('/admin/count/unread-count', middleware.verifyToken, roleMiddleware('isAdmin'), notificationsController.getAdminUnreadNotificationCount);


module.exports = router;