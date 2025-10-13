const express = require('express');
const router = express.Router();
const upload = require('../multer/multer');
const productController = require('../controllers/product');
const middleware = require('../helper/middleware');
const roleMiddleware = require('../helper/roles')
const Category = require('../database/models/category');
const Product = require('../database/models/product');
const Cart = require('../database/models/cart');

// Create a new post (suppliers and admins can post)
router.post('/product', middleware.verifyToken, roleMiddleware(['isSupplier', 'isAdmin']), upload.array('images'), productController.productPost);
// by user
router.delete('/product/delete', middleware.verifyToken, productController.deletProduct);
router.get('/products',middleware.verifyToken,productController.getProducts );
// Advanced product filtering with location support
router.get('/products/filter',middleware.verifyToken,productController.getProductsWithFilters);
router.get('/supplier/items', middleware.verifyToken, roleMiddleware('isSupplier'), productController.getProductsByUser);
router.get('/supplier/productscount',middleware.verifyToken, roleMiddleware('isSupplier'), productController.getProductsCountforSupplier );
router.get('/admin/productscount',middleware.verifyToken, roleMiddleware('isAdmin'), productController.getProductsCountforAmin );

router.get('/product/:customIdentifier', productController.getProductByCustomIdentifier);
router.put('/product/:customIdentifer', middleware.verifyToken, roleMiddleware(['isSupplier', 'isAdmin']), upload.array('images'), productController.updateProduct);

router.get('/admin/allitems', middleware.verifyToken, roleMiddleware('isAdmin'), productController.getAllProducts);

router.put('/admin/updatepost/:customIdentifer', middleware.verifyToken, roleMiddleware('isAdmin'), productController.updateAnyProduct)

router.get('/products/by-category/:customIdentifier',middleware.verifyToken, async (req, res) => {
    try {
        const userId = req.userId
        const { customIdentifier } = req.params;
        const category = await Category.findOne({ customIdentifer: customIdentifier }).exec();
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        const start = parseInt(req.query.start) || 0;
        const limit = parseInt(req.query.limit) || 10;
        const products = await Product.find({ category: category._id,  countInStock: { $gte: 1 } })  .sort({ date: -1 })
        .select('prodName images customIdentifer prodDesc countInStock prodSize prodPrice')
        .skip(start)
        .limit(limit).exec();
  // Fetch the user's cart
  const cart = await Cart.findOne({ user: userId });
  // Check if each product is in the user's cart using findIndex
  const productsWithCartStatus = products.map(product => {
      const productId = product._id.toString();
      const itemIndex = cart ? cart.items.findIndex(item => {
          console.log("Comparing cart item ID:", item.product.toString(), "with product ID:", product._id.toString());
          return item.product.toString() === product._id.toString();
      }) : -1;
                  const isInCart = itemIndex !== -1;  // If itemIndex is not -1, product is in the cart

      return {
          ...product._doc,  // Spread the product document
          inCart: isInCart  // Add the 'inCart' status
      };
  });

  // Total number of products in the database
  const totalProducts = await Product.countDocuments({ countInStock: { $gt: 1 } });

  // Send the response with total products and the modified products array
  res.status(200).json({
      totalProducts,
      products: productsWithCartStatus
  });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


router.get('/supplier/products/search', middleware.verifyToken,roleMiddleware('isSupplier'), async (req, res) => {
    try {
      const {  query = '', category, minPrice, maxPrice, start = 0, limit = 10 } = req.query;
  
      const supplierId = req.userId;
      // Validate that supplierId is provided
      if (!supplierId) {
        return res.status(400).json({ message: 'Supplier ID is required.' });
      }
  
      // Build search conditions dynamically
      const searchConditions = {
        user: supplierId, // Fetch products by this supplier
        $and: [],
      };
  
      // Add product name or description filtering (text search)
      if (query) {
        searchConditions.$and.push({
          $or: [
            { prodName: { $regex: query, $options: 'i' } },
            { prodDesc: { $regex: query, $options: 'i' } },
          ],
        });
      }
  
      // Add category filtering if provided
      if (category) {
        searchConditions.$and.push({ category });
      }
  
      // Add price range filtering if provided
      if (minPrice || maxPrice) {
        searchConditions.$and.push({
          prodPrice: {
            ...(minPrice && { $gte: parseFloat(minPrice) }),
            ...(maxPrice && { $lte: parseFloat(maxPrice) }),
          },
        });
      }
  
      // Remove empty $and array to avoid invalid queries
      if (!searchConditions.$and.length) delete searchConditions.$and;
  
      // Fetch matching products with pagination
      const products = await Product.find(searchConditions)
        .skip(parseInt(start))
        .limit(parseInt(limit)).sort({date:-1})
        .populate('category', 'name') // Populate category with name
        .lean();
  
      const totalResults = await Product.countDocuments(searchConditions); // Get total count for pagination
  
      // Respond with paginated results
      res.status(200).json({ products, totalResults });
    } catch (error) {
      console.error('Error fetching supplier products:', error);
      res.status(500).json({ message: 'Server error.' });
    }
  });

module.exports = router;