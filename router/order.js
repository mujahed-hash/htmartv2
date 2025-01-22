const express = require('express');
const router = express.Router();
const upload = require('../multer/multer');
const OrderController = require('../controllers/order');
const middleware = require('../helper/middleware');
const roleMiddleware = require('../helper/roles')
const Order = require('../database/models/order');



router.get('/order/items', middleware.verifyToken, OrderController.getOrders);

// router.put('/:id/status', middleware.verifyToken, OrderController.updateOrderStatus);

router.get('/order/:customIdentifier', middleware.verifyToken, OrderController.getOrderByCustomId);
router.get('/supplier/orderscount', middleware.verifyToken,roleMiddleware('isSupplier'), OrderController.getSupplierOrderCounts);
router.get('/admin/orderscount', middleware.verifyToken,roleMiddleware('isAdmin'), OrderController.getOrderCountsAdmin);

router.get('/supplier/orders',middleware.verifyToken, roleMiddleware('isSupplier'), async (req, res) => {
    try {
      const supplierId = req.userId; // Using req.userId
      const orders = await OrderController.getSupplierOrders(supplierId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  router.get('/admin/allorders/:status', middleware.verifyToken, roleMiddleware('isAdmin'), async (req, res) => {
    try {
      const start = parseInt(req.query.start) || 0;
      const limit = parseInt(req.query.limit) || 10;
        const { status } = req.params; // Status should be extracted directly
        const { totalOrders, orders }  = await OrderController.getOrdersByStatus(status,start, limit); // Pass the status directly as a string
        res.status(200).json({ totalOrders, orders });
      } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
  
router.get('/supplier/orders/pending', middleware.verifyToken, roleMiddleware('isSupplier'), async (req, res) => {
  try {
    const supplierId = req.userId;
    const start = parseInt(req.query.start) || 0;
    const limit = parseInt(req.query.limit) || 10;

    const { totalOrders, orders } = await OrderController.getSupplierOrdersByStatus(supplierId, 'Pending', start, limit);
    res.status(200).json({ totalOrders, orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

  // Endpoint to get approved orders
router.get('/supplier/orders/approved', middleware.verifyToken, roleMiddleware('isSupplier'), async (req, res) => {
    try {
      const supplierId = req.userId; // Using req.userId
      const orders = await OrderController.getSupplierOrdersByStatus(supplierId, 'Approved');
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  router.get('/supplier/orders/delivered', middleware.verifyToken, roleMiddleware('isSupplier'), async (req, res) => {
    try {
      const supplierId = req.userId; // Using req.userId
      const orders = await OrderController.getSupplierDeliveredOrders(supplierId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  router.get('/supplier/orders/cancelled', middleware.verifyToken, roleMiddleware('isSupplier'), async (req, res) => {
    try {
      const supplierId = req.userId; // Using req.userId
      const orders = await OrderController.getSupplierOrdersByStatus(supplierId, 'Cancelled');
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Endpoint to update order status
  router.put('/supplier/orders/:orderId/status', middleware.verifyToken, roleMiddleware('isSupplier'), async (req, res) => {
    const { orderId } = req.params;
    const supplierId = req.userId; // Assuming this is the supplier ID from the middleware
    const { userId, newStatus } = req.body; // Extract userId and newStatus from the request body

    try {
      // Validate that userId and newStatus are provided
      if (!userId || !newStatus) {
        return res.status(400).json({ message: 'Missing userId or newStatus in request body' });
      }
  
      // Call the function to update the order status
      const updatedOrder = await OrderController.updateOrderStatus(supplierId, orderId,userId, newStatus);
      res.json(updatedOrder);
    } catch (error) {
      console.error('Error updating order status:', error.message);
      res.status(400).json({ message: error.message });
    }
  });
  
  router.get('/admin/orders',middleware.verifyToken, roleMiddleware('isAdmin'), OrderController.getAllOrders)
module.exports = router