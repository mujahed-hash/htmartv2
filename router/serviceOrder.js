const express = require('express');
const router = express.Router();
const serviceOrderController = require('../controllers/serviceOrder');
const middleware = require('../helper/middleware');
const roleMiddleware = require('../helper/roles');

// Create a new service order (requires authentication)
router.post(
    '/service-orders',
    middleware.verifyToken,
    serviceOrderController.createServiceOrder
);

// Get user's service orders (requires authentication)
router.get(
    '/service-orders/user',
    middleware.verifyToken,
    serviceOrderController.getUserServiceOrders
);

// Get supplier's service orders (requires authentication)
router.get(
    '/service-orders/supplier',
    middleware.verifyToken,
    serviceOrderController.getSupplierServiceOrders
);

// Get a single service order by customIdentifier (requires authentication)
router.get(
    '/service-orders/:customIdentifier',
    middleware.verifyToken,
    serviceOrderController.getServiceOrderById
);

// Add a message to a service order's conversation (requires authentication)
router.post(
    '/service-orders/:customIdentifier/message',
    middleware.verifyToken,
    serviceOrderController.addMessageToServiceOrder
);

// Update service order status (requires authentication, supplier or admin only)
router.put(
    '/service-orders/:customIdentifier/status',
    middleware.verifyToken,
    serviceOrderController.updateServiceOrderStatus
);

// Cancel a service order (requires authentication, user or admin only)
router.put(
    '/service-orders/:customIdentifier/cancel',
    middleware.verifyToken,
    serviceOrderController.cancelServiceOrder
);

module.exports = router;
