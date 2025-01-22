const express = require('express');
const router = express.Router();
const middleware = require('../helper/middleware');
const roleMiddleware = require('../helper/roles')
const asyncHandler = require('express-async-handler');

const Notification = require('../database/models/notification');
const notificationsController = require('../controllers/notifications');

router.use(middleware.verifyToken);
router.get('/notifications',async(req,res)=>{
    const notification = await Notification.find({userId:req.userId}).sort({date:-1}).populate({
        path:'userId',
        select:'name'
    })

    res.send(notification);

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
    const notifications = await Notification.find().sort({date:-1});
    res.send(notifications);
})

router.post('/notifications', asyncHandler(notificationsController.triggerNotification));

// Mark all notifications as read for admin
router.put('/admin/mark-all-read',middleware.verifyToken ,roleMiddleware('isAdmin'), notificationsController.markAllAsAdminRead);

// Get unread notification count for admin
router.get('/admin/count/unread-count', roleMiddleware('isAdmin'), notificationsController.getAdminUnreadNotificationCount);


module.exports = router;