const User = require('../database/models/user');
const argon2 = require('argon2');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Import all relevant models (excluding User, which you want to keep)
const Product = require('../database/models/product');
const Category = require('../database/models/category');
const Order = require('../database/models/order');
const Cart = require('../database/models/cart');
const Notification = require('../database/models/notification');
const Request = require('../database/models/request');
const Requirements = require('../database/models/requirements');
const Service = require('../database/models/service');
const ServiceCategory = require('../database/models/serviceCategory');
const ServiceOrder = require('../database/models/serviceOrder');


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

exports.cleanupTestData = async (req, res) => {
  try {
    console.log('🧹 Initiating test data cleanup...');
    // 1. Verify superadmin privileges
    const userId = req.userId;
    const superadmin = await User.findById(userId);

    if (!superadmin || !superadmin.isSuperAdmin) {
      console.warn('🚫 Cleanup attempt by non-superadmin user:', userId);
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super admin privileges required for cleanup.'
      });
    }

    // 2. Require explicit confirmation
    const { confirmDeletion } = req.body;
    if (!confirmDeletion === true) {
      console.warn('❌ Cleanup request denied: No explicit confirmation received.');
      return res.status(400).json({
        success: false,
        message: 'Explicit confirmation (confirmDeletion: true) is required to proceed with data cleanup.'
      });
    }

    console.log('✅ Superadmin confirmed data deletion. Proceeding with cleanup.');

    const cleanupSummary = {
      productsDeleted: 0,
      productImagesDeleted: 0,
      categoriesDeleted: 0,
      categoryImagesDeleted: 0,
      ordersDeleted: 0,
      cartsDeleted: 0,
      notificationsDeleted: 0,
      requestsDeleted: 0,
      requestImagesDeleted: 0,
      requirementsDeleted: 0,
      requirementImagesDeleted: 0,
      servicesDeleted: 0,
      serviceImagesDeleted: 0,
      serviceCategoriesDeleted: 0,
      serviceCategoryImagesDeleted: 0,
      serviceOrdersDeleted: 0,
      // Add more as needed
    };

    // Helper function to delete images from file system
    const deleteImagesFromFileSystem = async (imageUrls, uploadDir) => {
      let deletedCount = 0;
      for (const imageUrl of imageUrls) {
        try {
          const imageFileName = imageUrl.split('/').pop();
          const imageFilePath = path.join(__dirname, '..', 'uploads', uploadDir, imageFileName);
          if (fs.existsSync(imageFilePath)) {
            await fs.promises.unlink(imageFilePath);
            deletedCount++;
            console.log('🗑️ Deleted image file:', imageFilePath);
          } else {
            console.warn('⚠️ Image file not found (skipped deletion):', imageFilePath);
          }
        } catch (fileError) {
          console.error('❌ Error deleting image file ', imageUrl, ':', fileError);
        }
      }
      return deletedCount;
    };

    // --- PRODUCTS CLEANUP ---
    console.log('⏳ Cleaning up Products...');
    const products = await Product.find({});
    const productImages = products.flatMap(p => p.images || []);
    cleanupSummary.productImagesDeleted = await deleteImagesFromFileSystem(productImages, 'products');
    const productDeleteResult = await Product.deleteMany({});
    cleanupSummary.productsDeleted = productDeleteResult.deletedCount;
    console.log(`✅ Deleted ${cleanupSummary.productsDeleted} products.`);

    // --- CATEGORIES CLEANUP ---
    console.log('⏳ Cleaning up Categories...');
    const categories = await Category.find({});
    const categoryImages = categories.flatMap(c => c.image || []); // Assuming category has a single 'image' field
    cleanupSummary.categoryImagesDeleted = await deleteImagesFromFileSystem(categoryImages, 'categories');
    const categoryDeleteResult = await Category.deleteMany({});
    cleanupSummary.categoriesDeleted = categoryDeleteResult.deletedCount;
    console.log(`✅ Deleted ${cleanupSummary.categoriesDeleted} categories.`);

    // --- REQUESTS CLEANUP ---
    console.log('⏳ Cleaning up Requests...');
    const requests = await Request.find({});
    const requestImages = requests.flatMap(r => r.images || []);
    cleanupSummary.requestImagesDeleted = await deleteImagesFromFileSystem(requestImages, 'requirements'); // Assuming requests use 'requirements' upload folder
    const requestDeleteResult = await Request.deleteMany({});
    cleanupSummary.requestsDeleted = requestDeleteResult.deletedCount;
    console.log(`✅ Deleted ${cleanupSummary.requestsDeleted} requests.`);

    // --- REQUIREMENTS CLEANUP ---
    console.log('⏳ Cleaning up Requirements...');
    const requirements = await Requirements.find({});
    const requirementImages = requirements.flatMap(r => r.images || []);
    cleanupSummary.requirementImagesDeleted = await deleteImagesFromFileSystem(requirementImages, 'requirements');
    const requirementDeleteResult = await Requirements.deleteMany({});
    cleanupSummary.requirementsDeleted = requirementDeleteResult.deletedCount;
    console.log(`✅ Deleted ${cleanupSummary.requirementsDeleted} requirements.`);

    // --- SERVICES CLEANUP ---
    console.log('⏳ Cleaning up Services...');
    const services = await Service.find({});
    const serviceImages = services.flatMap(s => s.images || []);
    cleanupSummary.serviceImagesDeleted = await deleteImagesFromFileSystem(serviceImages, 'services');
    const serviceDeleteResult = await Service.deleteMany({});
    cleanupSummary.servicesDeleted = serviceDeleteResult.deletedCount;
    console.log(`✅ Deleted ${cleanupSummary.servicesDeleted} services.`);

    // --- SERVICE CATEGORIES CLEANUP ---
    console.log('⏳ Cleaning up Service Categories...');
    const serviceCategories = await ServiceCategory.find({});
    const serviceCategoryImages = serviceCategories.flatMap(sc => sc.image || []); // Assuming service category has a single 'image' field
    cleanupSummary.serviceCategoryImagesDeleted = await deleteImagesFromFileSystem(serviceCategoryImages, 'service-categories');
    const serviceCategoryDeleteResult = await ServiceCategory.deleteMany({});
    cleanupSummary.serviceCategoriesDeleted = serviceCategoryDeleteResult.deletedCount;
    console.log(`✅ Deleted ${cleanupSummary.serviceCategoriesDeleted} service categories.`);

    // --- ORDERS CLEANUP ---
    console.log('⏳ Cleaning up Orders...');
    const orderDeleteResult = await Order.deleteMany({});
    cleanupSummary.ordersDeleted = orderDeleteResult.deletedCount;
    console.log(`✅ Deleted ${cleanupSummary.ordersDeleted} orders.`);

    // --- CARTS CLEANUP ---
    console.log('⏳ Cleaning up Carts...');
    const cartDeleteResult = await Cart.deleteMany({});
    cleanupSummary.cartsDeleted = cartDeleteResult.deletedCount;
    console.log(`✅ Deleted ${cleanupSummary.cartsDeleted} carts.`);

    // --- NOTIFICATIONS CLEANUP ---
    console.log('⏳ Cleaning up Notifications...');
    const notificationDeleteResult = await Notification.deleteMany({});
    cleanupSummary.notificationsDeleted = notificationDeleteResult.deletedCount;
    console.log(`✅ Deleted ${cleanupSummary.notificationsDeleted} notifications.`);

    console.log('🎉 Test data cleanup complete!');
    res.status(200).json({
      success: true,
      message: 'Test data and associated images deleted successfully (user accounts retained).',
      cleanupSummary
    });
  } catch (error) {
    console.error('❌ Error during test data cleanup:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during cleanup',
      error: error.message
    });
  }
};