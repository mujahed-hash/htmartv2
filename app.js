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
const superadminRoute = require('./router/superadmin');
const middleware = require('./helper/middleware');
const Notification = require('./database/models/notification');
const User = require('./database/models/user');
const argon2 = require('argon2');
const slugify = require('slugify');
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
app.use('/uploads/services', express.static(path.join(__dirname, '/uploads/services'))); // Add static path for services
app.use('/uploads/service-categories', express.static(path.join(__dirname, '/uploads/service-categories'))); // Add static path for service categories

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
app.use('/api/superadmin', superadminRoute);
app.use('/api', require('./router/service')); // Add the service route
app.use('/api', require('./router/serviceCategory')); // Add the service category route
app.use('/api', require('./router/serviceOrder')); // Add the service order route
app.use('/api/admin', require('./router/adminServiceOrder')); // Add the admin service order route

// Serve the frontend static files
app.use(express.static(path.join(__dirname, 'public')));

// Catch-all route for frontend SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

// Function to ensure super admin exists
async function ensureSuperAdmin() {
  try {
    // Check if a super admin already exists
    const existingSuperAdmin = await User.findOne({ isSuperAdmin: true });
    
    if (existingSuperAdmin) {
      console.log('Super admin already exists:', existingSuperAdmin.email);
      return;
    }
    
    // Super admin details
    const name = 'Super Admin';
    const email = 'superadmin@super.com';
    const password = 'Sadmin123';
    const phone = '1234567890';
    const firstname = 'Super'; // Add firstname
    const lastname = 'Admin'; // Add lastname
    const image = 'assets/images/default-avatar.png'; // Add default image
    
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      // Update existing user to super admin
      existingUser.isSuperAdmin = true;
      existingUser.isAdmin = true;
      existingUser.firstname = firstname; // Update firstname
      existingUser.lastname = lastname;   // Update lastname
      existingUser.image = image;         // Update image
      
      await existingUser.save();
      console.log('Existing user updated to super admin:', existingUser.email);
    } else {
      // Create new super admin user
      const passwordHash = await argon2.hash(password);
      const randomComponent = Date.now().toString();
      const customIdentifier = `${slugify(name, { lower: true })}-${randomComponent}`;
      
      const superAdmin = new User({
        name,
        email,
        passwordHash,
        phone,
        isAdmin: true,
        isSuperAdmin: true,
        customIdentifer: customIdentifier,
        firstname: firstname, // Set firstname for new super admin
        lastname: lastname,   // Set lastname for new super admin
        image: image          // Set image for new super admin
      });
      
      await superAdmin.save();
      console.log('Super admin created automatically:', superAdmin.email);
      console.log('Super admin credentials: Email:', email, '- Password:', password);
    }
  } catch (error) {
    console.error('Error ensuring super admin exists:', error);
  }
}

// Start the server
const port = 3000;
server.listen(port, async function () {
  console.log(`Express server running on http://localhost:${port}`);
  
  // Ensure super admin exists when server starts
  await ensureSuperAdmin();
});
