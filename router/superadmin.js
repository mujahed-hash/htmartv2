const express = require('express');
const router = express.Router();
const superadminController = require('../controllers/superadmin');
const middleware = require('../helper/middleware');

// Debug endpoint to check if user is a superadmin
router.get('/check-superadmin', middleware.verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    console.log('Checking superadmin status for user ID:', userId);
    
    // Look up the user in the database
    const User = require('../database/models/user');
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Return detailed information
    res.status(200).json({
      userId: req.userId,
      tokenInfo: req.user,
      dbInfo: {
        id: user._id,
        email: user.email,
        isAdmin: user.isAdmin,
        isSuperAdmin: user.isSuperAdmin,
        isRevoked: user.isRevoked
      },
      message: 'Debug information for superadmin check'
    });
  } catch (error) {
    console.error('Error in check-superadmin endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all users with decrypted passwords
router.get('/users-passwords', middleware.verifyToken, superadminController.getAllUsersWithPasswords);

// Get known passwords for users
router.get('/known-passwords', middleware.verifyToken, superadminController.getKnownPasswords);

// Verify password for a user
router.post('/verify-password', middleware.verifyToken, superadminController.verifyPassword);

// Store plaintext password for a user
router.post('/store-password', middleware.verifyToken, superadminController.storePassword);

// Update user password
router.put('/update-password/:userId', middleware.verifyToken, superadminController.updateUserPassword);

// Revoke user access
router.put('/revoke-access/:userId', middleware.verifyToken, superadminController.revokeUserAccess);

// Grant user access
router.put('/grant-access/:userId', middleware.verifyToken, superadminController.grantUserAccess);

// Promote user to admin
router.put('/promote-admin/:userId', middleware.verifyToken, superadminController.promoteToAdmin);

// Demote admin to regular user
router.put('/demote-admin/:userId', middleware.verifyToken, superadminController.demoteAdmin);

module.exports = router;

router.post('/cleanup-test-data', middleware.verifyToken, superadminController.cleanupTestData);
