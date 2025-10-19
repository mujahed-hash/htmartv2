const express = require('express');
const router = express.Router();
const upload = require('../multer/multer'); // Assuming you have a multer setup for products
const uploadService = require('../multer/serviceMulter'); // Import the new service-specific multer
const serviceController = require('../controllers/service');
const middleware = require('../helper/middleware');
const roleMiddleware = require('../helper/roles');

// Create a new service (requires authentication and image upload)
router.post(
    '/services',
    middleware.verifyToken,
    uploadService.array('images', 10), // Use uploadService for service images
    serviceController.createService
);

// Get active services only (for all-services page)
router.get('/services/active', serviceController.getActiveServices);

// Get all unique regions from active services
router.get('/services/regions', serviceController.getAllRegions);

// Get all services (can be filtered, paginated) - requires authentication for My Services and Admin Services views
router.get('/services', middleware.verifyToken, serviceController.getAllServices);

// Get a single service by custom identifier
router.get('/services/:customIdentifier', serviceController.getServiceByCustomIdentifier);

// Update a service (requires authentication and image upload, owner or admin/superadmin only)
router.put(
    '/services/:customIdentifier',
    middleware.verifyToken,
    uploadService.array('images', 10), // Use uploadService for service images
    serviceController.updateService
);

// Delete a service (requires authentication, owner or admin/superadmin only)
router.delete(
    '/services/:customIdentifier',
    middleware.verifyToken,
    serviceController.deleteService
);

// Approve a service (admin or superadmin only)
router.put(
    '/services/approve/:customIdentifier',
    middleware.verifyToken,
    roleMiddleware('isAdmin', 'isSuperAdmin'), // Middleware to check for admin or superadmin role
    serviceController.approveService
);

// Toggle service active status (admin or superadmin only)
router.put(
    '/services/toggle-status/:customIdentifier',
    middleware.verifyToken,
    roleMiddleware('isAdmin', 'isSuperAdmin'), // Middleware to check for admin or superadmin role
    serviceController.toggleServiceStatus
);

module.exports = router;
