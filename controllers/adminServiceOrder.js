const ServiceOrder = require('../database/models/serviceOrder');
const Service = require('../database/models/service');
const User = require('../database/models/user');
const Notification = require('../database/models/notification');

// Get all service orders with filtering and pagination (Admin only)
exports.getAllServiceOrders = async (req, res) => {
  try {
    // Verify the user is an admin or superadmin
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user || (!user.isAdmin && !user.isSuperAdmin)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const {
      page = 1,
      start = 0, // Support both page and start for infinite scroll
      limit = 20,
      status,
      search,
      dateFrom,
      dateTo,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    // Use start if provided, otherwise calculate from page
    const skipValue = start ? parseInt(start) : (parseInt(page) - 1) * parseInt(limit);

    // Build filter object
    const filter = {};

    // Filter by status if provided
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Filter by date range if provided
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) filter.date.$lte = new Date(dateTo);
    }

    // Build search query if provided
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { customIdentifier: searchRegex },
        { 'customerInfo.name': searchRegex },
        { 'customerInfo.email': searchRegex },
        { 'customerInfo.phone': searchRegex }
      ];

      // Also search in service name and supplier name
      const serviceIds = await Service.find({ serviceName: searchRegex }).distinct('_id');
      if (serviceIds.length > 0) {
        filter.$or.push({ service: { $in: serviceIds } });
      }

      const userIds = await User.find({ name: searchRegex }).distinct('_id');
      if (userIds.length > 0) {
        filter.$or.push({ user: { $in: userIds } }, { supplier: { $in: userIds } });
      }
    }

    // Calculate skip for pagination (already calculated above as skipValue)

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get total count for pagination
    const totalCount = await ServiceOrder.countDocuments(filter);

    // Get orders with populated data
    const orders = await ServiceOrder.find(filter)
      .populate('service', 'serviceName serviceDesc price images customIdentifier')
      .populate('user', 'name email phone image customIdentifier')
      .populate('supplier', 'name email phone image customIdentifier')
      .sort(sort)
      .skip(skipValue)
      .limit(parseInt(limit))
      .lean();

    // Calculate pagination info for infinite scroll
    const hasMore = orders.length === parseInt(limit);

    // Calculate current page from start value for display purposes
    const currentPageFromStart = Math.floor(parseInt(start) / parseInt(limit)) + 1;

    res.status(200).json({
      success: true,
      orders,
      pagination: {
        totalCount,
        hasMore,
        currentPage: currentPageFromStart,
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        hasNextPage: hasMore,
        hasPrevPage: parseInt(start) > 0,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error fetching all service orders:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching service orders.',
      error: error.message
    });
  }
};

// Get service order statistics for admin dashboard
exports.getServiceOrderStats = async (req, res) => {
  try {
    // Verify the user is an admin or superadmin
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user || (!user.isAdmin && !user.isSuperAdmin)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const stats = await ServiceOrder.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          confirmedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
          },
          inProgressOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
          },
          completedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          totalRevenue: { $sum: '$totalPrice' },
          averageOrderValue: { $avg: '$totalPrice' }
        }
      }
    ]);

    // Get recent orders
    const recentOrders = await ServiceOrder.find()
      .populate('service', 'serviceName')
      .populate('user', 'name')
      .populate('supplier', 'name')
      .sort({ date: -1 })
      .limit(10)
      .lean();

    // Get orders by status for chart
    const ordersByStatus = await ServiceOrder.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.status(200).json({
      success: true,
      stats: stats[0] || {
        totalOrders: 0,
        pendingOrders: 0,
        confirmedOrders: 0,
        inProgressOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0
      },
      recentOrders,
      ordersByStatus
    });

  } catch (error) {
    console.error('Error fetching service order stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics.',
      error: error.message
    });
  }
};

// Get single service order by ID (Admin only)
exports.getServiceOrderById = async (req, res) => {
  try {
    // Verify the user is an admin or superadmin
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user || (!user.isAdmin && !user.isSuperAdmin)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { customIdentifier } = req.params;
    console.log('Backend received customIdentifier:', customIdentifier);

    const order = await ServiceOrder.findOne({ customIdentifier })
      .populate('service', 'serviceName serviceDesc price images customIdentifier')
      .populate('user', 'name email phone image customIdentifier')
      .populate('supplier', 'name email phone image customIdentifier')
      .populate('conversation.sender', 'name customIdentifier image')
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Service order not found.'
      });
    }

    res.status(200).json({
      success: true,
      order
    });

  } catch (error) {
    console.error('Error fetching service order by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching service order.',
      error: error.message
    });
  }
};

// Update service order (Admin only)
exports.updateServiceOrder = async (req, res) => {
  try {
    // Verify the user is an admin or superadmin
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user || (!user.isAdmin && !user.isSuperAdmin)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { customIdentifier } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated by admin
    const allowedFields = [
      'status',
      'paymentStatus',
      'notes',
      'quantity',
      'price',
      'totalPrice',
      'customerInfo'
    ];

    const filteredUpdate = {};
    allowedFields.forEach(field => {
      if (updateData.hasOwnProperty(field)) {
        filteredUpdate[field] = updateData[field];
      }
    });

    // Validate status if being updated
    if (filteredUpdate.status) {
      const allowedStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'awaiting_user_response', 'awaiting_admin_action'];
      if (!allowedStatuses.includes(filteredUpdate.status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status provided.'
        });
      }
    }

    // Validate payment status if being updated
    if (filteredUpdate.paymentStatus) {
      const allowedPaymentStatuses = ['pending', 'paid', 'refunded'];
      if (!allowedPaymentStatuses.includes(filteredUpdate.paymentStatus)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment status provided.'
        });
      }
    }

    const order = await ServiceOrder.findOneAndUpdate(
      { customIdentifier },
      { ...filteredUpdate, updatedBy: userId },
      { new: true, runValidators: true }
    )
    .populate('service', 'serviceName serviceDesc price images customIdentifier')
    .populate('user', 'name email phone image customIdentifier')
    .populate('supplier', 'name email phone image customIdentifier')
    .populate('conversation.sender', 'name customIdentifier image');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Service order not found.'
      });
    }

    // Create notification for order update
    const notificationsToCreate = [];

    // Notify the user who placed the order
    notificationsToCreate.push({
      userId: order.user._id,
      message: `Your order (${order.customIdentifier}) has been updated. New status: ${order.status}`,
      orderIdentifier: order.customIdentifier,
      isRead: false,
      adminRead: false,
      type: 'service-order-update'
    });

    // Notify the supplier
    notificationsToCreate.push({
      userId: order.supplier._id,
      message: `Order (${order.customIdentifier}) has been updated by admin. New status: ${order.status}`,
      orderIdentifier: order.customIdentifier,
      isRead: false,
      adminRead: false,
      type: 'service-order-update'
    });

    // Save notifications
    if (notificationsToCreate.length > 0) {
      await Notification.insertMany(notificationsToCreate);
    }

    res.status(200).json({
      success: true,
      message: 'Service order updated successfully.',
      order
    });

  } catch (error) {
    console.error('Error updating service order:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating service order.',
      error: error.message
    });
  }
};

// Delete service order (Admin only)
exports.deleteServiceOrder = async (req, res) => {
  try {
    // Verify the user is an admin or superadmin
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user || (!user.isAdmin && !user.isSuperAdmin)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { customIdentifier } = req.params;

    const order = await ServiceOrder.findOneAndDelete({ customIdentifier });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Service order not found.'
      });
    }

    // Delete related notifications
    await Notification.deleteMany({ orderIdentifier: order.customIdentifier });

    res.status(200).json({
      success: true,
      message: 'Service order deleted successfully.'
    });

  } catch (error) {
    console.error('Error deleting service order:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting service order.',
      error: error.message
    });
  }
};

// Cancel service order (Admin only)
exports.cancelServiceOrderByAdmin = async (req, res) => {
  try {
    // Verify the user is an admin or superadmin
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user || (!user.isAdmin && !user.isSuperAdmin)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { customIdentifier } = req.params;
    const { reason } = req.body;

    const order = await ServiceOrder.findOne({ customIdentifier })
      .populate('service', 'serviceName serviceDesc price images customIdentifier')
      .populate('user', 'name')
      .populate('supplier', 'name');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Service order not found.'
      });
    }

    // Check if order can be cancelled
    if (order.status === 'completed' || order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This order cannot be cancelled as it is already completed or cancelled.'
      });
    }

    // Update order status and add cancellation note
    order.status = 'cancelled';
    order.cancellationReason = reason || 'Cancelled by admin';
    order.cancelledBy = userId;
    order.cancelledAt = new Date();

    await order.save();

    // Create notifications
    const notificationsToCreate = [];

    // Notify the user who placed the order
    notificationsToCreate.push({
      userId: order.user._id,
      message: `Your order (${order.customIdentifier}) has been cancelled by admin. ${reason ? `Reason: ${reason}` : ''}`,
      orderIdentifier: order.customIdentifier,
      isRead: false,
      adminRead: false,
      type: 'service-order-cancelled'
    });

    // Notify the supplier
    notificationsToCreate.push({
      userId: order.supplier._id,
      message: `Order (${order.customIdentifier}) has been cancelled by admin. ${reason ? `Reason: ${reason}` : ''}`,
      orderIdentifier: order.customIdentifier,
      isRead: false,
      adminRead: false,
      type: 'service-order-cancelled'
    });

    // Save notifications
    if (notificationsToCreate.length > 0) {
      await Notification.insertMany(notificationsToCreate);
    }

    res.status(200).json({
      success: true,
      message: 'Service order cancelled successfully.',
      order
    });

  } catch (error) {
    console.error('Error cancelling service order by admin:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling service order.',
      error: error.message
    });
  }
};

// Get service orders by status (Admin only)
exports.getServiceOrdersByStatus = async (req, res) => {
  try {
    // Verify the user is an admin or superadmin
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user || (!user.isAdmin && !user.isSuperAdmin)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { status } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Validate status
    const allowedStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'awaiting_user_response', 'awaiting_admin_action'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status provided.'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await ServiceOrder.find({ status })
      .populate('service', 'serviceName serviceDesc price images customIdentifier')
      .populate('user', 'name email phone image customIdentifier')
      .populate('supplier', 'name email phone image customIdentifier')
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const totalCount = await ServiceOrder.countDocuments({ status });

    res.status(200).json({
      success: true,
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalCount,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error fetching service orders by status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching service orders.',
      error: error.message
    });
  }
};

// Add a message to a service order's conversation (Admin only)
exports.addMessageToServiceOrder = async (req, res) => {
  try {
    // Verify the user is an admin or superadmin
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user || (!user.isAdmin && !user.isSuperAdmin)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { customIdentifier } = req.params;
    const { message, newStatus } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required.'
      });
    }

    const order = await ServiceOrder.findOne({ customIdentifier });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Service order not found.'
      });
    }

    // Create new message object
    const newMessage = {
      sender: userId,
      role: 'admin',
      message: message,
      timestamp: new Date()
    };

    order.conversation.push(newMessage);

    // Optionally update status based on who sent the message or a provided newStatus
    if (newStatus) {
      order.status = newStatus;
    } else if (order.status === 'awaiting_admin_action') {
      order.status = 'awaiting_user_response';
    }

    await order.save();

    // Find the newly added message in the conversation array and populate its sender
    // We need to re-fetch or carefully populate the specific message within the order
    // for the response to contain the full sender details.
    // For simplicity and correctness, we will populate the entire conversation array
    // after saving the order, then return the updated order.
    const updatedOrder = await ServiceOrder.findOne({ customIdentifier })
      .populate('service', 'serviceName serviceDesc price images customIdentifier')
      .populate('user', 'name email phone image customIdentifier')
      .populate('supplier', 'name email phone image customIdentifier')
      .populate('conversation.sender', 'name customIdentifier image')
      .lean();

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: 'Service order not found after update.'
      });
    }

    // Create notifications
    const notificationsToCreate = [];

    // Notify the user who placed the order
    notificationsToCreate.push({
      userId: updatedOrder.user._id,
      message: `Admin replied to your service order (${updatedOrder.customIdentifier}). Please check the conversation.`,
      orderIdentifier: updatedOrder.customIdentifier,
      isRead: false,
      adminRead: false,
      type: 'service-order-message'
    });

    // Notify the supplier
    if (updatedOrder.supplier && updatedOrder.supplier._id.toString() !== userId) {
      notificationsToCreate.push({
        userId: updatedOrder.supplier._id,
        message: `Admin replied to service order (${updatedOrder.customIdentifier}). Please check the conversation.`,
        orderIdentifier: updatedOrder.customIdentifier,
        isRead: false,
        adminRead: false,
        type: 'service-order-message'
      });
    }

    // Save notifications
    if (notificationsToCreate.length > 0) {
      await Notification.insertMany(notificationsToCreate);
    }

    res.status(200).json({
      success: true,
      message: 'Message added to service order conversation.',
      order: updatedOrder,
      newMessage: updatedOrder.conversation[updatedOrder.conversation.length - 1] // Return the last message with populated sender
    });

  } catch (error) {
    console.error('Error adding message to service order:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding message to service order.',
      error: error.message
    });
  }
};

// Bulk update service orders (Admin only)
exports.bulkUpdateServiceOrders = async (req, res) => {
  try {
    // Verify the user is an admin or superadmin
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user || (!user.isAdmin && !user.isSuperAdmin)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { orderIds, updates } = req.body;

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order IDs array is required.'
      });
    }

    // Validate updates
    const allowedFields = ['status', 'paymentStatus'];
    const filteredUpdates = {};
    allowedFields.forEach(field => {
      if (updates.hasOwnProperty(field)) {
        filteredUpdates[field] = updates[field];
      }
    });

    if (Object.keys(filteredUpdates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid updates provided.'
      });
    }

    // Validate status if being updated
    if (filteredUpdates.status) {
      const allowedStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'awaiting_user_response', 'awaiting_admin_action'];
      if (!allowedStatuses.includes(filteredUpdates.status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status provided.'
        });
      }
    }

    // Validate payment status if being updated
    if (filteredUpdates.paymentStatus) {
      const allowedPaymentStatuses = ['pending', 'paid', 'refunded'];
      if (!allowedPaymentStatuses.includes(filteredUpdates.paymentStatus)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment status provided.'
        });
      }
    }

    // Update orders
    const result = await ServiceOrder.updateMany(
      { _id: { $in: orderIds } },
      { ...filteredUpdates, updatedBy: userId },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} service orders updated successfully.`,
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Error bulk updating service orders:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while bulk updating service orders.',
      error: error.message
    });
  }
};
