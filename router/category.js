const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categories');
const roleMiddleware = require('../helper/roles')
const middleware = require('../helper/middleware');
const upload = require('../multer/catMulter');

// Create a new category
router.post('/category',middleware.verifyToken, roleMiddleware('isAdmin'),upload.array('image'), categoryController.createCategory);

// List all categories
router.get('/categories', categoryController.listCategories);

// Get a category by ID
router.get('/category/:id', categoryController.getCategoryById);
router.put('/category/:id', middleware.verifyToken,upload.array('image'), categoryController.updateCategory);
router.delete('/category/delete-category', middleware.verifyToken, categoryController.deleteCategory);
module.exports = router;
