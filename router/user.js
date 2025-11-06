const express = require('express');
const router = express.Router();
const User = require('../database/models/user');
const argon2 = require('argon2');
const middleware = require('../helper/middleware');
const role = require('../helper/roles')
const FcmToken = require('../database/models/fcmToken'); // Import FcmToken model
const { sendPushNotification } = require('../helper/pushNotifications'); // Import push notification helper

// User registration route
router.post('/users/register', async (req, res) => {
  try {
    const { name, email, password, phone, isAdmin, isSuperAdmin, customIdentifer, firstname, lastname, image } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const passwordHash = await argon2.hash(password);

    const user = new User({
      name,
      email,
      passwordHash,
      phone,
      isAdmin: isAdmin || false,
      isSuperAdmin: isSuperAdmin || false,
      customIdentifer,
      firstname,
      lastname,
      image,
    });

    await user.save();
    res.status(201).json({ message: 'User registered successfully', userId: user._id });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// User login route
router.post('/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const passwordMatch = await argon2.verify(user.passwordHash, password);
    if (!passwordMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = middleware.generateToken(user._id, user.isAdmin, user.isSupplier, user.isBuyer);
    res.status(200).json({ message: 'Logged in successfully', token, userId: user._id, isAdmin: user.isAdmin, isSupplier: user.isSupplier, isBuyer: user.isBuyer });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Save FCM token endpoint
router.post('/users/save-fcm-token', middleware.verifyToken, async (req, res) => {
  try {
    const { userId, fcmToken } = req.body;

    // Validate input
    if (!userId || !fcmToken) {
      return res.status(400).json({ error: 'User ID and FCM token are required' });
    }

    // Find and update if token already exists for this user, otherwise create new
    const updatedFcmToken = await FcmToken.findOneAndUpdate(
      { userId: userId, fcmToken: fcmToken }, // Find by userId AND fcmToken to prevent duplicate entries for same user/device
      { $set: { userId: userId, fcmToken: fcmToken, deviceType: req.body.deviceType || 'android' } }, // Update with new data
      { upsert: true, new: true, setDefaultsOnInsert: true } // Create if not found, return new doc
    );

    console.log(`FCM token saved successfully for user ${userId}: ${updatedFcmToken.fcmToken}`);

    // Send a welcome push notification after saving/updating the token
    await sendPushNotification(
      userId,
      'Welcome to Hotelmart!',
      'App is installed and enjoy the New way to Business',
      { type: 'welcome' }
    );

    res.status(200).json({ message: 'FCM token saved successfully', fcmToken: updatedFcmToken });
  } catch (error) {
    console.error('Error saving FCM token:', error);
    res.status(500).json({ error: 'Failed to save FCM token' });
  }
});

module.exports = router;