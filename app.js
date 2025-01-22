require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const app = express();
const { mongoose } = require('./database/mongoose');
const userRoute = require('./router/user');
const catRoute = require('./router/category');
const prodRoute = require('./router/product');
const orderRoute = require('./router/order');
const reqRoute = require('./router/requirements');
const SearchProd = require('./router/search');
const adminSearch = require('./router/adminsearch');
const Makerequest = require('./router/request');
const NotificationRoute = require('./router/notification');
const middleware = require('./helper/middleware');
const Notification = require('./database/models/notification');
const path = require('path');

// Import socket handling functions
const { initSocket, getIo, connectedUsers } = require('./socket'); // Import socket management

// Create HTTP server
const server = http.createServer(app);
app.use(cors());

// Initialize Socket.io with server
initSocket(server); // Initialize Socket.IO with the server

const cartRoute = require('./router/cart');






// WebSocket event handlers
const sendUnreadCountUpdate = async (userId) => {
  const unreadCount = await Notification.countDocuments({ userId, isRead: false });
  const socketId = connectedUsers.get(userId.toString());
  if (socketId) {
    getIo().to(socketId).emit('unreadCountUpdate', unreadCount);
  }
};

const sendNotification = (userId, notification) => {
  const socketId = connectedUsers.get(userId.toString());
  if (socketId) {
    getIo().to(socketId).emit('notification', notification);
  } else {
    console.log(`User ${userId} is not connected.`);
  }
};

// Notification Route - Trigger new notification
app.post('/notifications', middleware.verifyToken, async (req, res) => {
  try {
    const newNotification = new Notification({
      userId: req.userId,
      message: req.body.message,
      type: req.body.type,
    });

    await newNotification.save(); // Save notification in DB

    // Emit notification to the user
    sendNotification(req.userId, { type: newNotification.type, message: newNotification.message });

    // Emit updated unread count
    sendUnreadCountUpdate(req.userId);

    res.status(201).json(newNotification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// Unread Count Route - Fetch unread count
app.get('/count/unread-count', middleware.verifyToken, async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({ userId: req.userId, isRead: false });
    sendUnreadCountUpdate(req.userId);

    res.status(200).json({ unreadCount });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

// Middleware setup
app.use(express.json({ limit: '80mb' }));
app.use(express.urlencoded({ limit: '80mb', extended: true }));

// Static file serving for uploads
app.use('/uploads/products', express.static(path.join(__dirname, '/uploads/products')));
app.use('/uploads/categories', express.static(path.join(__dirname, '/uploads/categories')));
app.use('/uploads/requirements', express.static(path.join(__dirname, '/uploads/requirements/')));

// API routes
app.use('/api', userRoute);
app.use('/api', catRoute);
app.use('/api', prodRoute);
app.use('/api', cartRoute);
app.use('/api', orderRoute);
app.use('/api/request', reqRoute);
app.use('/api', SearchProd);
app.use('/api', adminSearch);
app.use('/api', Makerequest);
app.use('/api', NotificationRoute);

// Serve the frontend static files
app.use(express.static(path.join(__dirname, 'public')));

// Catch-all route for frontend SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

// Start the server
const port = 3000;
server.listen(port, function () {
  console.log(`Express server running on http://localhost:${port}`);
});
