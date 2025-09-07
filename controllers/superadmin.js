const User = require('../database/models/user');
const argon2 = require('argon2');
const crypto = require('crypto');

// Secret key for password decryption (in a real app, this would be stored securely)
const ENCRYPTION_KEY = process.env.SECRET || 'superadmin-secret-key-for-password-decryption';

// Get all users with decrypted passwords
exports.getAllUsersWithPasswords = async (req, res) => {
  try {
    // Verify the user is a superadmin
    const userId = req.userId;
    const user = await User.findById(userId);
    
    if (!user || !user.isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super admin privileges required.'
      });
    }
    
    // Get all users
    const users = await User.find().select('-__v').sort({ date: -1 });
    
    // Return users with their password hashes
    const usersWithPasswords = users.map(user => {
      return user.toObject();
    });
    
    return res.status(200).json(usersWithPasswords);
  } catch (error) {
    console.error('Error fetching users with passwords:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Verify password for a user (for super admin use only)
exports.verifyPassword = async (req, res) => {
  try {
    // Verify the user is a superadmin
    const userId = req.userId;
    const superadmin = await User.findById(userId);
    
    if (!superadmin || !superadmin.isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super admin privileges required.'
      });
    }
    
    const { targetUserId, password } = req.body;
    
    if (!targetUserId || !password) {
      return res.status(400).json({
        success: false,
        message: 'User ID and password are required'
      });
    }
    
    // Find the target user
    const targetUser = await User.findById(targetUserId);
    
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Verify the password against the hash
    const isMatch = await argon2.verify(targetUser.passwordHash, password);
    
    return res.status(200).json({
      success: true,
      isMatch,
      message: isMatch ? 'Password matches' : 'Password does not match'
    });
  } catch (error) {
    console.error('Error verifying password:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Store plaintext password (for super admin use only)
exports.storePassword = async (req, res) => {
  try {
    // Verify the user is a superadmin
    const userId = req.userId;
    const superadmin = await User.findById(userId);
    
    if (!superadmin || !superadmin.isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super admin privileges required.'
      });
    }
    
    const { targetUserId, plaintextPassword } = req.body;
    
    if (!targetUserId || !plaintextPassword) {
      return res.status(400).json({
        success: false,
        message: 'User ID and plaintext password are required'
      });
    }
    
    // Find the target user
    const targetUser = await User.findById(targetUserId);
    
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Store the plaintext password in a separate field (for super admin use only)
    // This is a security risk in a production environment but useful for admin purposes
    targetUser.adminPasswordNote = plaintextPassword;
    await targetUser.save();
    
    return res.status(200).json({
      success: true,
      message: 'Password note stored successfully'
    });
  } catch (error) {
    console.error('Error storing password note:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update user password
exports.updateUserPassword = async (req, res) => {
  try {
    // Verify the user is a superadmin
    const userId = req.userId;
    const superadmin = await User.findById(userId);
    
    if (!superadmin || !superadmin.isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super admin privileges required.'
      });
    }
    
    const { password } = req.body;
    const targetUserId = req.params.userId;
    
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }
    
    // Hash the new password
    const passwordHash = await argon2.hash(password);
    
    // Update the user's password
    const updatedUser = await User.findByIdAndUpdate(
      targetUserId,
      { 
        passwordHash,
        adminPasswordNote: password // Store plaintext for admin reference
      },
      { new: true }
    ).select('-passwordHash');
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Password updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user password:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get known passwords for users
exports.getKnownPasswords = async (req, res) => {
  try {
    // Verify the user is a superadmin
    const userId = req.userId;
    const user = await User.findById(userId);
    
    if (!user || !user.isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super admin privileges required.'
      });
    }
    
    // Get all users with their admin password notes
    const users = await User.find().select('_id name email adminPasswordNote passwordHash').sort({ date: -1 });
    
    // Add default passwords for known accounts if they don't have an admin password note
    const usersWithPasswords = users.map(user => {
      const userData = user.toObject();
      
      // If no admin password note, set default passwords based on email/role
      if (!userData.adminPasswordNote) {
        if (userData.email === 'superadmin@super.com') {
          userData.adminPasswordNote = 'Sadmin123';
        } else if (userData.email && userData.email.includes('admin')) {
          userData.adminPasswordNote = 'admin123';
        } else if (userData.email && userData.email.includes('buyer')) {
          userData.adminPasswordNote = 'buyer123';
        } else if (userData.email && userData.email.includes('supplier')) {
          userData.adminPasswordNote = 'supplier123';
        }
      }
      
      return userData;
    });
    
    return res.status(200).json(usersWithPasswords);
  } catch (error) {
    console.error('Error fetching known passwords:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Revoke user access
exports.revokeUserAccess = async (req, res) => {
  try {
    // Verify the user is a superadmin
    const userId = req.userId;
    const superadmin = await User.findById(userId);
    
    if (!superadmin || !superadmin.isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super admin privileges required.'
      });
    }
    
    const targetUserId = req.params.userId;
    
    // Update the user's access status
    const updatedUser = await User.findByIdAndUpdate(
      targetUserId,
      { isRevoked: true },
      { new: true }
    ).select('-passwordHash');
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'User access revoked successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error revoking user access:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Grant user access
exports.grantUserAccess = async (req, res) => {
  try {
    // Verify the user is a superadmin
    const userId = req.userId;
    const superadmin = await User.findById(userId);
    
    if (!superadmin || !superadmin.isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super admin privileges required.'
      });
    }
    
    const targetUserId = req.params.userId;
    
    // Update the user's access status
    const updatedUser = await User.findByIdAndUpdate(
      targetUserId,
      { isRevoked: false },
      { new: true }
    ).select('-passwordHash');
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'User access granted successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error granting user access:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Promote user to admin
exports.promoteToAdmin = async (req, res) => {
  try {
    // Verify the user is a superadmin
    const userId = req.userId;
    const superadmin = await User.findById(userId);
    
    if (!superadmin || !superadmin.isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super admin privileges required.'
      });
    }
    
    const targetUserId = req.params.userId;
    
    // Update the user's role
    const updatedUser = await User.findByIdAndUpdate(
      targetUserId,
      { isAdmin: true },
      { new: true }
    ).select('-passwordHash');
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'User promoted to admin successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error promoting user to admin:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Demote admin to regular user
exports.demoteAdmin = async (req, res) => {
  try {
    // Verify the user is a superadmin
    const userId = req.userId;
    const superadmin = await User.findById(userId);
    
    if (!superadmin || !superadmin.isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super admin privileges required.'
      });
    }
    
    const targetUserId = req.params.userId;
    
    // Update the user's role
    const updatedUser = await User.findByIdAndUpdate(
      targetUserId,
      { isAdmin: false },
      { new: true }
    ).select('-passwordHash');
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Admin demoted successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error demoting admin:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};