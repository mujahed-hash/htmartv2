const Product = require('../database/models/product');
const User = require('../database/models/user');
const slugify = require('slugify');
const mongoose = require('mongoose');
const Category = require('../database/models/category')
const { ObjectId } = require('mongodb');
const category = require('../database/models/category');
const Cart = require('../database/models/cart');
var path = require('path');
const fs = require('fs');

exports.productPost = async (req, res) => {
    try {
        console.log('📦 Product POST request received');
        console.log('Request body keys:', Object.keys(req.body));
        console.log('Files received:', req.files?.length || 0);
        
        // Get the user's ID from the token (req.user)
        const userId = req.userId;

        const { 
            prodName, prodDesc, category, prodPrice, countInStock, prodSize,
            // New enhanced fields
            brand, condition, minOrderQuantity, maxOrderQuantity, businessType,
            deliveryAvailable, estimatedDeliveryDays, freeDeliveryAbove, tags, locations
        } = req.body;
        
        console.log('📋 Product details:', {
            prodName,
            category,
            prodPrice,
            countInStock,
            prodSize,
            brand,
            condition,
            businessType
        });
        
        if (!category) {
            console.error('❌ Category is missing');
            return res.status(400).json({ error: 'Category is required' });
        }

        // Handle category - if it's a string (customIdentifer), find the ObjectId
        let categoryId = category;
        if (typeof category === 'string' && !category.match(/^[0-9a-fA-F]{24}$/)) {
            console.log('🔍 Category is a string, looking up by customIdentifer:', category);
            const categoryDoc = await Category.findOne({
                $or: [
                    { customIdentifer: category },
                    { customIdentifier: category } // Handle typo in field name
                ]
            });
            if (!categoryDoc) {
                console.error('❌ Category not found:', category);
                return res.status(400).json({ error: 'Invalid category identifier' });
            }
            categoryId = categoryDoc._id;
            console.log('✅ Found category ObjectId:', categoryId);
        }

        // Parse JSON fields
        console.log('📍 Locations raw:', locations);
        console.log('🏷️ Tags raw:', tags);
        
        const parsedLocations = locations ? JSON.parse(locations) : [];
        const parsedTags = tags ? JSON.parse(tags) : [];
        
        console.log('📍 Parsed locations:', parsedLocations);
        console.log('🏷️ Parsed tags:', parsedTags);

        // Validate locations
        if (!parsedLocations || parsedLocations.length === 0) {
            return res.status(400).json({ error: 'At least one location is required' });
        }

        const files = req.files;
        let images = [];
        const protocol = req.headers['x-forwarded-proto'] || req.protocol;
        const basePath = `${protocol}://${req.get('host')}/uploads/products`;
        if (files && files.length > 0) {
            files.forEach(file => {
                images.push(`${basePath}/${file.filename}`);
            });
        }

        const randomComponent = Date.now().toString();
        const customIdentifer = `${slugify(prodName, { lower: true })}-${randomComponent}`;
        
        const post = new Product({
            // Existing fields
            category: categoryId, // Use the resolved ObjectId
            user: req.userId,
            prodName,
            prodDesc,
            customIdentifer,
            images: images,
            prodPrice,
            countInStock,
            prodSize,

            // New enhanced fields
            locations: parsedLocations,
            brand: brand || '',
            condition: condition || 'new',
            minOrderQuantity: minOrderQuantity || 1,
            maxOrderQuantity: maxOrderQuantity || null,
            businessType: businessType || 'supplier',
            deliveryAvailable: deliveryAvailable === 'true' || deliveryAvailable === true,
            estimatedDeliveryDays: estimatedDeliveryDays || 7,
            freeDeliveryAbove: freeDeliveryAbove || null,
            tags: parsedTags,
            isActive: true,
            views: 0
        });

        console.log('💾 Saving product to database...');
        const postData = await post.save();
        console.log("✅ Product saved successfully! ID:", postData._id);

        console.log('👤 Updating user posts...');
        await User.findByIdAndUpdate(
            req.userId,
            { $push: { posts: postData._id } },
            { new: true }
        );

        console.log('✅ Product creation complete!');
        res.status(200).json(postData);
    } catch (error) {
        console.error('❌ Error creating product:', error);
        console.error('Error stack:', error.stack);
        
        let errorMessage = 'Server error while creating product';
        if (error.name === 'ValidationError') {
            errorMessage = 'Validation error: ' + Object.values(error.errors).map(e => e.message).join(', ');
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        res.status(500).json({ error: errorMessage });
    }
};

exports.createProduct = async (req, res) => {
    const category = await Category.findOne({ customIdentifer: req.body.catCustomIdentifer });

    if (!category) {
        return res.status(500).json({ error: 'Invalid category custom identifier' });
    }

    const files = req.files;
    let images = [];
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const basePath = `${protocol}://${req.get('host')}/uploads/products`;

    if (files) {
        files.map(file => {
            images.push(`${basePath}/${file.filename}`);
        });
    }

    let product = new Product({
        prodName: req.body.prodName,
        prodDesc: req.body.prodDesc,
        images: images,
        prodPrice: req.body.prodPrice,
        category: category._id, // Using the found category ID
        countInStock: req.body.countInStock,
        customIdentifer: req.body.customIdentifer,
        dateCreated: req.body.dateCreated,
        user: req.userId
    });

    try {
        const products = await product.save();
        res.status(201).send(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// exports.getAllProducts = async (req, res) => {
//     try {
//         const start = parseInt(req.query.start) || 0;
//         const limit = parseInt(req.query.limit) || 10;
//         const userId= req.userId;

//         const products = await Product.find().sort({date:-1}).populate('category').populate('user').skip(start)
//         .limit(limit);

//         const totalProducts = await Product.countDocuments({ userId: userId });

//         res.status(200).json({
//             totalProducts,
//             products
//         });

//         res.status(200).json(products);
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Server error');
//     }
// };
exports.getAllProducts = async (req, res) => {
    try {
        const start = parseInt(req.query.start) || 0;
        const limit = parseInt(req.query.limit) || 10;
        const userId = req.userId;

        // Fetch all products with pagination
        const products = await Product.find({ countInStock: { $gte: 1 } })
            .sort({ date: -1 })
            .populate('category')
            .populate('user')
            .skip(start)
            .limit(limit);

        // Fetch the user's cart
        const cart = await Cart.findOne({ user: userId });

        // Check if the user's cart exists and create an array of product IDs in the cart
        const cartProductIds = cart ? cart.items.map(item => item.product.toString()) : [];

        // Map through products to add 'inCart: true' if the product is in the user's cart
        const productsWithCartStatus = products.map(product => {
            return {
                ...product._doc,  // Spread the product document
                inCart: cartProductIds.includes(product._id.toString())  // Check if product ID is in the cart
            };
        });

        // Total number of products for the user (based on userId)
        const totalProducts = await Product.countDocuments({ user: userId });

        // Send the response with total products and modified products array
        res.status(200).json({
            totalProducts,
            products: productsWithCartStatus
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};

exports.getProductsCountforSupplier = async (req, res) => {
    try {
      const userId = req.userId; // Ensure this is correct based on your token payload
  
      const prodCount = await Product.find({ user: userId }).countDocuments();
  
      res.status(200).json({ count: prodCount });
    } catch (error) {
      console.error('Error occurred:', error);
      res.status(500).send('Error occurred: ' + error.message);
    }
  };
  exports.getProductsCountforAmin = async (req, res) => {
    try {
  
      const prodCount = await Product.find().countDocuments();
  
      res.status(200).json({ count: prodCount });
    } catch (error) {
      console.error('Error occurred:', error);
      res.status(500).send('Error occurred: ' + error.message);
    }
  };
exports.getProductsByUser = async (req, res) => {
    try {
        // Access the user ID from req.user
        const userId = req.userId; // Ensure this is correct based on your token payload
        const start = parseInt(req.query.start) || 0;
        const limit = parseInt(req.query.limit) || 10;
        // Validate ObjectId
        if (!mongoose.isValidObjectId(userId)) {
            console.log(userId)

            return res.status(400).send('Invalid user ID.');
        }
        const totalProducts = await Product.countDocuments({ user: userId, countInStock: { $gte: 1 } });

        // Query products by user ID
        const products = await Product.find({ user: userId }).sort({date:-1}).select('prodName images prodPrice customIdentifer')     .skip(start)
        .limit(limit);;

        // Always return the expected format, even if no products found
        res.status(200).json({
            totalProducts,
            products
        });
    } catch (error) {
        res.status(500).send('Server error: ' + error.message);
    }
};

// Fetch paginated products
// Fetch products with infinite scrolling
// exports.getProducts = async (req, res) => {
//     try {
//         // Get start and limit from query parameters
//         const start = parseInt(req.query.start) || 0; // Default to 0
//         const limit = parseInt(req.query.limit) || 10; // Default to 10 products per request

//         // Ensure limit is a positive number
//         if (limit <= 0) {
//             return res.status(400).json({ error: 'Limit must be a positive number' });
//         }

//         // Fetch products with limit and start
//         const products = await Product.find()
//             .skip(start)
//             .limit(limit);

//         // Count total products
//         const totalProducts = await Product.countDocuments();

//         // Send response with products and pagination info
//         res.status(200).json({
//             totalProducts,
//             products
//         });
//     } catch (error) {
//         console.error('Error fetching products:', error);
//         res.status(500).json({ message: error.message });
//     }
// };


// exports.getProducts = async (req, res) => {
//     try {
//         const start = parseInt(req.query.start) || 0;
//         const limit = parseInt(req.query.limit) || 10;
//         const userId= req.userId;
//         const products = await Product.find({ userId: userId }).sort({date:-1}).select('prodName images customIdentifer prodDesc countInStock prodSize prodPrice')
//             .skip(start)
//             .limit(limit);

//         const totalProducts = await Product.countDocuments({ userId: userId });

//         res.status(200).json({
//             totalProducts,
//             products
//         });
//     } catch (error) {
//         console.error('Error fetching products:', error);
//         res.status(500).json({ message: error.message });
//     }
// };
exports.getProducts = async (req, res) => {
    try {
        const start = parseInt(req.query.start) || 0;
        const limit = parseInt(req.query.limit) || 10;
        const userId = req.userId;

        // Fetch the products with pagination
        const products = await Product.find({ countInStock: { $gt: 1 } })
            .sort({ date: -1 })
            .select('prodName images customIdentifer prodDesc countInStock prodSize prodPrice locations') // Added 'locations'
            .skip(start)
            .limit(limit);

        // Fetch the user's cart
        const cart = await Cart.findOne({ user: userId })
        // console.log("Cart structure:", cart);
        // console.log("Fetched products:", products);
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
        const totalProducts = await Product.countDocuments({ countInStock: { $gt: 1 } }); // Changed $gt: 0 to $gt: 1

        // Check if there are more products available
        const hasMore = (start + limit) < totalProducts;

        // Send the response with total products, hasMore flag, and the modified products array
        res.status(200).json({
            totalProducts,
            hasMore,
            products: productsWithCartStatus
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Advanced Product Filtering with multi-location support
 * GET /api/products/filter
 * Query params: start, limit, cities, states, categories, minPrice, maxPrice, 
 *               condition, brand, businessType, sortBy, sortOrder, search
 */
exports.getProductsWithFilters = async (req, res) => {
    try {
        const start = parseInt(req.query.start) || 0;
        const limit = parseInt(req.query.limit) || 10;
        const userId = req.userId;

        // Build filter object
        const filter = {
            countInStock: { $gt: 0 },
            isActive: true
        };

        // Location filtering (cities - can be multiple)
        if (req.query.cities && req.query.cities.trim() !== '') {
            const cities = req.query.cities.split(',').map(city => city.trim());
            filter['locations.cityCode'] = { $in: cities };
        }

        // State filtering (can be multiple)
        if (req.query.states && req.query.states.trim() !== '') {
            const states = req.query.states.split(',').map(state => state.trim());
            filter['locations.stateCode'] = { $in: states };
        }

        // Category filtering (can be multiple category IDs)
        if (req.query.categories && req.query.categories.trim() !== '') {
            const categories = req.query.categories.split(',').map(cat => cat.trim());
            filter.category = { $in: categories };
        }

        // Price range filtering
        if (req.query.minPrice || req.query.maxPrice) {
            filter.prodPrice = {};
            if (req.query.minPrice) {
                filter.prodPrice.$gte = parseFloat(req.query.minPrice);
            }
            if (req.query.maxPrice) {
                filter.prodPrice.$lte = parseFloat(req.query.maxPrice);
            }
        }

        // Condition filtering (new, like-new, good, fair, refurbished)
        if (req.query.condition && req.query.condition.trim() !== '') {
            const conditions = req.query.condition.split(',').map(c => c.trim());
            filter.condition = { $in: conditions };
        }

        // Brand filtering (can be multiple)
        if (req.query.brand && req.query.brand.trim() !== '') {
            const brands = req.query.brand.split(',').map(b => b.trim());
            filter.brand = { $in: brands };
        }

        // Business Type filtering
        if (req.query.businessType && req.query.businessType.trim() !== '') {
            const businessTypes = req.query.businessType.split(',').map(bt => bt.trim());
            filter.businessType = { $in: businessTypes };
        }

        // Delivery filtering
        if (req.query.freeDelivery === 'true') {
            filter.freeDeliveryAbove = { $exists: true, $ne: null };
        }

        // Text search (product name, description, tags)
        if (req.query.search && req.query.search.trim() !== '') {
            filter.$text = { $search: req.query.search };
        }

        // Sorting
        let sortOption = {};
        const sortBy = req.query.sortBy || 'date';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

        switch (sortBy) {
            case 'price':
                sortOption = { prodPrice: sortOrder };
                break;
            case 'rating':
                sortOption = { averageRating: sortOrder };
                break;
            case 'views':
                sortOption = { views: sortOrder };
                break;
            case 'name':
                sortOption = { prodName: sortOrder };
                break;
            default:
                sortOption = { date: sortOrder };
        }

        console.log('Filter object:', JSON.stringify(filter, null, 2));
        console.log('Sort option:', sortOption);

        // Fetch products with filters
        const products = await Product.find(filter)
            .sort(sortOption)
            .populate('category')
            .populate('user', 'name email')
            .skip(start)
            .limit(limit);

        // Fetch user's cart
        const cart = await Cart.findOne({ user: userId });

        // Add cart status to products
        const productsWithCartStatus = products.map(product => {
            const itemIndex = cart ? cart.items.findIndex(item => 
                item.product.toString() === product._id.toString()
            ) : -1;
            const isInCart = itemIndex !== -1;

            return {
                ...product._doc,
                inCart: isInCart
            };
        });

        // Total count for pagination
        const totalProducts = await Product.countDocuments(filter);

        res.status(200).json({
            success: true,
            totalProducts,
            currentPage: Math.floor(start / limit) + 1,
            totalPages: Math.ceil(totalProducts / limit),
            hasMore: (start + limit) < totalProducts,
            filters: {
                cities: req.query.cities || 'all',
                states: req.query.states || 'all',
                categories: req.query.categories || 'all',
                priceRange: {
                    min: req.query.minPrice || 0,
                    max: req.query.maxPrice || 'unlimited'
                },
                condition: req.query.condition || 'all',
                brand: req.query.brand || 'all',
                businessType: req.query.businessType || 'all'
            },
            products: productsWithCartStatus
        });
    } catch (error) {
        console.error('Error fetching filtered products:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to fetch products',
            error: error.message 
        });
    }
};



exports.getProductByCustomIdentifier = async (req, res) => {
    try {
        const { customIdentifier } = req.params;
        const product = await Product.findOne({ customIdentifer: customIdentifier }).populate('category');

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.status(200).json(product);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Server error');
    }
};


// exports.updateProduct = async (req, res) => {
//     try {
//         // Get the user's ID from the token (req.user)
//         const userId = req.user.id;

//         // Extract customIdentifer from URL parameters
//         const { customIdentifer } = req.params;

//         // Extract product data from the request body
//         const { prodName, prodDesc, category, prodPrice, countInStock, prodSize } = req.body;

//         if (!customIdentifer) {
//             return res.status(400).json({ error: 'Product custom identifier is required' });
//         }

//         // Find the product by customIdentifer
//         let product = await Product.findOne({ customIdentifer });

//         if (!product) {
//             return res.status(404).json({ error: 'Product not found' });
//         }

//         // Update product details
//         let isUpdated = false;

//         if (prodName && prodName !== product.prodName) {
//             const randomComponent = Date.now().toString(); // You can replace this with your own logic
//             const newCustomIdentifer = `${slugify(prodName, { lower: true })}-${randomComponent}`;

//             product.customIdentifer = newCustomIdentifer;
//             isUpdated = true;
//         }

//         product.prodName = prodName || product.prodName;
//         product.prodDesc = prodDesc || product.prodDesc;
//         product.category = category || product.category;
//         product.prodPrice = prodPrice || product.prodPrice;
//         product.countInStock = countInStock || product.countInStock;
//         product.prodSize = prodSize || product.prodSize;

//         // Handle file uploads (if any)
//         const files = req.files;
//         const basePath = `${req.protocol}://${req.get('host')}/uploads/products`;

//         if (files && files.length > 0) {
//             // If new images are uploaded, update the images array
//             let images = files.map(file => `${basePath}/${file.filename}`);
//             product.images = images;
//             isUpdated = true;
//         }

//         // Save the updated product only if there are changes
//             const updatedProduct = await product.save();
//             res.status(200).json(updatedProduct);
        
//     } catch (error) {
//         console.error('Error:', error);
//         res.status(500).send('Server error');
//     }
// }

// exports.updateProduct = async (req, res) => {
//     try {
//         const userId = req.user.id;
//         const { customIdentifer } = req.params;
//         const { prodName, prodDesc, prodPrice, countInStock, prodSize } = req.body;
//         const category = await Category.findById(req.body.category);
//         if(!category){
//            return res.status(400).json({error:'invalid category'})
      
//         }
//         if (!customIdentifer) {
//             return res.status(400).json({ error: 'Product custom identifier is required' });
//         }

//         let product = await Product.findOne({ customIdentifer }).populate('user');

//         if (!product) {
//             return res.status(404).json({ error: 'Product not found' });
//         }

//         let categoryId = null;
//         // if (categoryCustomIdentifer) {
//         //     const category = await Category.findOne({ customIdentifer: categoryCustomIdentifer });
//         //     if (category) {
//         //         categoryId = category._id;
//         //     } else {
//         //         return res.status(400).json({ error: 'Invalid category custom identifier' });
//         //     }
//         // }
        
//         if( product.user && product.user._id.toString() === userId.toString() ){
            

//         let isUpdated = false;
//         if (prodName && prodName !== product.prodName) {
//             const randomComponent = Date.now().toString();
//             const newCustomIdentifer = `${slugify(prodName, { lower: true })}-${randomComponent}`;

//             product.customIdentifer = newCustomIdentifer;
//             isUpdated = true;
//         }

//         product.prodName = prodName || product.prodName;
//         product.prodDesc = prodDesc || product.prodDesc;
//         product.category = category || product.category;
//         product.prodPrice = prodPrice || product.prodPrice;
//         product.countInStock = countInStock || product.countInStock;
//         product.prodSize = prodSize || product.prodSize;
//         product.user = req.userId

//         const files = req.files;
//         const basePath = `${req.protocol}://${req.get('host')}/uploads/products`;

//         if (files && files.length > 0) {
//             let images = files.map(file => `${basePath}/${file.filename}`);
//             product.images = images;
//             isUpdated = true;
//         }

//             const updatedProduct = await product.save();
//             res.status(200).json(updatedProduct);
        
        
//     } 
//     else{
//         return res.send('you are not authorised to edit this document')
//     }
// }
//     catch (error) {
//         console.error('Error updating product:', error); // Log detailed error
//         res.status(500).send('Server error');
//     }
   

// }

exports.updateProduct = async (req, res) => {
    try {
        const userId = req.userId;
        const { customIdentifer } = req.params;
        const { 
            prodName, prodDesc, prodPrice, countInStock, prodSize,
            // New enhanced fields
            brand, condition, minOrderQuantity, maxOrderQuantity, businessType,
            deliveryAvailable, estimatedDeliveryDays, freeDeliveryAbove, tags, locations
        } = req.body;

        // Handle category - if it's a string (customIdentifer), find the ObjectId
        let categoryId = req.body.category;
        if (typeof req.body.category === 'string' && !req.body.category.match(/^[0-9a-fA-F]{24}$/)) {
            console.log('🔍 Update: Category is a string, looking up by customIdentifer:', req.body.category);
            const categoryDoc = await Category.findOne({
                $or: [
                    { customIdentifer: req.body.category },
                    { customIdentifier: req.body.category } // Handle typo in field name
                ]
            });
            if (!categoryDoc) {
                console.error('❌ Update: Category not found:', req.body.category);
                return res.status(400).json({ error: 'Invalid category identifier' });
            }
            categoryId = categoryDoc._id;
            console.log('✅ Update: Found category ObjectId:', categoryId);
        }

        // Validate custom identifier
        if (!customIdentifer) {
            return res.status(400).json({ error: 'Product custom identifier is required' });
        }

        // Find product by custom identifier and populate user field
        let product = await Product.findOne({ customIdentifer }).populate('user');
        console.log('Product:', product);
        console.log('User ID:', userId);
        console.log('Product User:', product.user);
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Check if the product has an associated user
        if (product.user && product.user._id) {
            // Check if the logged-in user is the product owner
            if (product.user._id.toString() === userId.toString()) {
                let isUpdated = false;

                // Update custom identifier if prodName is changed
                if (prodName && prodName !== product.prodName) {
                    const randomComponent = Date.now().toString();
                    const newCustomIdentifer = `${slugify(prodName, { lower: true })}-${randomComponent}`;
                    product.customIdentifer = newCustomIdentifer;
                    isUpdated = true;
                }

                // Update existing product details
                product.prodName = prodName || product.prodName;
                product.prodDesc = prodDesc || product.prodDesc;
                product.category = categoryId || product.category;
                product.prodPrice = prodPrice || product.prodPrice;
                product.countInStock = countInStock || product.countInStock;
                product.prodSize = prodSize || product.prodSize;

                // Update enhanced fields
                if (locations) {
                    const parsedLocations = JSON.parse(locations);
                    if (parsedLocations && parsedLocations.length > 0) {
                        product.locations = parsedLocations;
                    }
                }
                
                if (tags) {
                    product.tags = JSON.parse(tags);
                }
                
                product.brand = brand !== undefined ? brand : product.brand;
                product.condition = condition || product.condition;
                product.minOrderQuantity = minOrderQuantity || product.minOrderQuantity;
                product.maxOrderQuantity = maxOrderQuantity || product.maxOrderQuantity;
                product.businessType = businessType || product.businessType;
                product.deliveryAvailable = deliveryAvailable === 'true' || deliveryAvailable === true;
                product.estimatedDeliveryDays = estimatedDeliveryDays || product.estimatedDeliveryDays;
                product.freeDeliveryAbove = freeDeliveryAbove || product.freeDeliveryAbove;
                product.lastUpdated = new Date();

                // Handle file uploads if any
                const files = req.files;
                const protocol = req.headers['x-forwarded-proto'] || req.protocol;
                const basePath = `${protocol}://${req.get('host')}/uploads/products`;

                if (files && files.length > 0) {
                    const images = files.map(file => `${basePath}/${file.filename}`);
                    product.images = images;
                    isUpdated = true;
                }

                // Save the updated product
                const updatedProduct = await product.save();
                return res.status(200).json(updatedProduct);
            } else {
                return res.status(403).json({ error: 'You are not authorized to edit this product' });
            }
        } else {
            return res.status(400).json({ error: 'Product user information is missing' });
        }
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Server error' });
    }
};


exports.updateAnyProduct = async (req, res) => {
    try {
        const userId = req.user.id;
        const { customIdentifer } = req.params;
        const { prodName, prodDesc, prodPrice, countInStock, prodSize } = req.body;
        const category = await Category.findById(req.body.category);
        if(!category){
           return res.status(400).json({error:'invalid category'})
      
        }
        if (!customIdentifer) {
            return res.status(400).json({ error: 'Product custom identifier is required' });
        }

        let product = await Product.findOne({ customIdentifer });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        let categoryId = null;
        // if (categoryCustomIdentifer) {
        //     const category = await Category.findOne({ customIdentifer: categoryCustomIdentifer });
        //     if (category) {
        //         categoryId = category._id;
        //     } else {
        //         return res.status(400).json({ error: 'Invalid category custom identifier' });
        //     }
        // }
        
            

        let isUpdated = false;
        if (prodName && prodName !== product.prodName) {
            const randomComponent = Date.now().toString();
            const newCustomIdentifer = `${slugify(prodName, { lower: true })}-${randomComponent}`;

            product.customIdentifer = newCustomIdentifer;
            isUpdated = true;
        }

        product.prodName = prodName || product.prodName;
        product.prodDesc = prodDesc || product.prodDesc;
        product.category = category || product.category;
        product.prodPrice = prodPrice || product.prodPrice;
        product.countInStock = countInStock || product.countInStock;
        product.prodSize = prodSize || product.prodSize;
        product.user = req.userId

        const files = req.files;
        const protocol = req.headers['x-forwarded-proto'] || req.protocol;
        const basePath = `${protocol}://${req.get('host')}/uploads/products`;
        if (files && files.length > 0) {
            let images = files.map(file => `${basePath}/${file.filename}`);
            product.images = images;
            isUpdated = true;
        }

            const updatedProduct = await product.save();
            res.status(200).json(updatedProduct);
        
        
   
}
    catch (error) {
        console.error('Error updating product:', error); // Log detailed error
        res.status(500).send('Server error');
    }
   

}

// DELETE /products/:id

exports.deletProduct = async (req,res)=>{
    try {
        const productId = req.body._id;

        // Find the product by ID
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ status: 'failed', message: 'Product not found' });
        }

        // Remove each image file from the storage
        product.images.forEach(image => {
            // Construct the path to the image file
            const imageFileName = image.split('/').pop(); // Extract the file name from the URL
            const imageFilePath = path.join(__dirname, '..', 'uploads', 'products', imageFileName);

            // Delete the image file from the storage
            fs.unlink(imageFilePath, (err) => {
                if (err) {
                    console.error('Error deleting image file:', err);
                }
            });
        });

        // Delete the product from the database
        await Product.findByIdAndDelete(productId);

        res.status(200).json({ status: 'success', message: 'Product and associated images deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'failed', error: 'Server error' });
    }
}
// router.delete('/product/delete', async (req, res) => {
//     try {
//         const productId = req.body._id; // Get the product ID from the request parameters

//         // Check if the ID is valid (optional)
//         if (!mongoose.Types.ObjectId.isValid(productId)) {
//             return res.status(400).send('Invalid product ID');
//         }

//         // Find and delete the product
//         const result = await Product.findByIdAndDelete(productId);

//         // If no product was found, send a 404 response
//         if (!result) {
//             return res.status(404).send('Product not found');
//         }

//         // Send a success response
//         res.status(200).send('Product deleted successfully');
//     } catch (error) {
//         // Handle any errors that occurred during the process
//         res.status(500).send('Server error');
//     }
// });