const express = require('express');
const router = express.Router();
const Product = require('../models/product'); // Adjust the path accordingly

// Search Route
// router.get('/search', async (req, res) => {
//   try {
//     const searchTerm = req.query.q; // Get the search term from query params

//     // Perform a text search using MongoDB's $text
//     const products = await Product.find({
//       $text: { $search: searchTerm }
//     });

//     // If you need to sort by relevance, use the meta field 'textScore'
//     const sortedProducts = await Product.find({
//       $text: { $search: searchTerm }
//     }).sort({ score: { $meta: 'textScore' } });

//     res.status(200).json(sortedProducts);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

module.exports = router;
