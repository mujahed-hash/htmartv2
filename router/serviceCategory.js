const express = require('express');
const router = express.Router();
const middleware = require('../helper/middleware');
const serviceCategoryController = require('../controllers/serviceCategory');
const uploadCategoryImage = require('../multer/serviceCategoryMulter');

// Public routes (no authentication required)

/**
 * @route   GET /api/service-categories
 * @desc    Get all service categories
 * @access  Public
 */
router.get('/service-categories', serviceCategoryController.getServiceCategories);

/**
 * @route   GET /api/service-categories/:identifier
 * @desc    Get a single service category by ID or custom identifier
 * @access  Public
 */
router.get('/service-categories/:identifier', serviceCategoryController.getServiceCategory);

/**
 * @route   GET /api/service-categories/:identifier/services
 * @desc    Get services by category
 * @access  Public
 */
router.get('/service-categories/:identifier/services', serviceCategoryController.getServicesByCategory);

// Protected routes (authentication required)

/**
 * @route   POST /api/service-categories
 * @desc    Create a new service category
 * @access  Admin/SuperAdmin
 */
router.post(
    '/service-categories', 
    middleware.verifyToken,
    uploadCategoryImage.single('image'),
    serviceCategoryController.createServiceCategory
);

/**
 * @route   PUT /api/service-categories/:identifier
 * @desc    Update a service category
 * @access  Admin/SuperAdmin
 */
router.put(
    '/service-categories/:identifier',
    middleware.verifyToken,
    uploadCategoryImage.single('image'),
    serviceCategoryController.updateServiceCategory
);

/**
 * @route   DELETE /api/service-categories/:identifier
 * @desc    Delete a service category
 * @access  Admin/SuperAdmin
 */
router.delete(
    '/service-categories/:identifier',
    middleware.verifyToken,
    serviceCategoryController.deleteServiceCategory
);

module.exports = router;
