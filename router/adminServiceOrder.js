const express = require('express');
const router = express.Router();
const adminServiceOrderController = require('../controllers/adminServiceOrder');
const middleware = require('../helper/middleware');

// All routes require admin authentication
router.use(middleware.verifyToken);

// Get all service orders with filtering and pagination
router.get(
  '/service-orders',
  adminServiceOrderController.getAllServiceOrders
);

// Get service order statistics
router.get(
  '/service-orders/stats',
  adminServiceOrderController.getServiceOrderStats
);

// Get single service order by ID
router.get(
  '/service-orders/:customIdentifier',
  adminServiceOrderController.getServiceOrderById
);

// Update service order
router.put(
  '/service-orders/:customIdentifier',
  adminServiceOrderController.updateServiceOrder
);

// Delete service order
router.delete(
  '/service-orders/:customIdentifier',
  adminServiceOrderController.deleteServiceOrder
);

// Cancel service order by admin
router.put(
  '/service-orders/:customIdentifier/cancel',
  adminServiceOrderController.cancelServiceOrderByAdmin
);

// Get service orders by status
router.get(
  '/service-orders/status/:status',
  adminServiceOrderController.getServiceOrdersByStatus
);

// Add a message to a service order's conversation
router.post(
  '/service-orders/:customIdentifier/message',
  adminServiceOrderController.addMessageToServiceOrder
);

// Bulk update service orders
router.put(
  '/service-orders/bulk-update',
  adminServiceOrderController.bulkUpdateServiceOrders
);

module.exports = router;
