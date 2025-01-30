const express = require('express');
const router = express.Router();
const upload = require('../multer/multer');
const CartController = require('../controllers/cart');
const middleware = require('../helper/middleware');
const roleMiddleware = require('../helper/roles')


router.get('/cart/items', middleware.verifyToken, CartController.getCart);
router.delete('/cart/item', middleware.verifyToken, CartController.removeCartItem);


router.post('/addtocart', middleware.verifyToken, CartController.addItemToCart);

router.post('/cart/checkoutSingle', middleware.verifyToken, CartController.checkoutSingle);

router.post('/cart/checkoutAll', middleware.verifyToken, CartController.checkoutAll);
router.get('/cart/count',  middleware.verifyToken, CartController.getCartItemCount);

module.exports = router