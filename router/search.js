const express = require('express');
const router = express.Router();
const Category = require('../database/models/category');
const Product = require('../database/models/product');
const Cart = require('../database/models/cart');
const middleware = require('../helper/middleware');

// Search Route
// Search Route with Pagination
router.get('/products/search', middleware.verifyToken, async (req, res) => {
    try {
        const { query } = req.query; // User's search query
        const start = parseInt(req.query.start) || 0; // Pagination start
        const limit = parseInt(req.query.limit) || 10; // Pagination limit
        const userId = req.userId; // Extract userId from token

        let products = [];
        let categoryIds = [];

        if (query) {
            // Find matching categories by itemType using regex
            const categories = await Category.find({ 
                itemType: { $regex: query, $options: 'i' } 
            }).exec();
            categoryIds = categories.map(category => category._id);

            // Search products by name, description, or category using regex
            products = await Product.find({
                $or: [
                    { prodName: { $regex: query, $options: 'i' } },
                    { prodDesc: { $regex: query, $options: 'i' } },
                    { category: { $in: categoryIds } }
                ]
            })
            .populate('category', 'itemName itemType')
            .select('prodName prodDesc customIdentifer images prodPrice countInStock prodSize isFeatured date')
            .skip(start)
            .limit(limit)
            .sort({ date: -1 });
        }

        // Fetch the user's cart
        const cart = await Cart.findOne({ user: userId });

        // Check if each product is in the user's cart
        const productsWithCartStatus = products.map(product => {
            const isInCart = cart?.items.some(
                item => item.product.toString() === product._id.toString()
            ) || false;

            return {
                ...product._doc,
                inCart: isInCart
            };
        });

        // Count total matching products for pagination
        const totalProducts = await Product.countDocuments({
            $or: [
                { prodName: { $regex: query, $options: 'i' } },
                { prodDesc: { $regex: query, $options: 'i' } },
                { category: { $in: categoryIds } }
            ]
        });

        // Send response with total products and results
        res.status(200).json({ totalProducts, products: productsWithCartStatus });
    } catch (error) {
        console.error('Error performing search:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


module.exports = router;