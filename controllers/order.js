const asyncHandler = require('express-async-handler');
const Order = require('../database/models/order');
const Product = require('../database/models/product');
const mongoose = require('mongoose');

// @desc    Get all orders for a user
// @route   GET /api/orders
// @access  Private (for buyer)
const getAllOrders = asyncHandler(async (req, res) => {
  const start = parseInt(req.query.start) || 0;
  const limit = parseInt(req.query.limit) || 20;
    const orders = await Order.find().sort({date:-1}).populate('customIdentifer').populate('orderItems.product', 'prodName prodPrice images customIdentifer').populate('user')
    .skip(start)
    .limit(limit);

const totalOrders = await Order.countDocuments();
    if (!orders) {
        res.status(404);
        throw new Error('No orders found');
    }
    res.status(200).json({
      totalOrders,
      orders
  });
});

const getOrders = asyncHandler(async (req, res) => {
  const start = parseInt(req.query.start) || 0;
  const limit = parseInt(req.query.limit) || 20;
  const orders = await Order.find({ user: req.userId }).sort({date:-1}).populate('orderItems.product', 'prodName prodPrice images customIdentifer').skip(start).limit(limit);

  const totalOrders = await Order.countDocuments({ user: req.userId });

  if (!orders) {
      res.status(404);
      throw new Error('No orders found');
  }

  res.status(200).json({
    totalOrders,
    orders
  });
});

// @desc    Get a single order by ID
// @route   GET /api/orders/:id
// @access  Private (for buyer)
const getOrderByCustomId = asyncHandler(async (req, res) => {
  const { customIdentifier } = req.params;

  const order = await Order.findOne({ customIdentifer: customIdentifier })
  .populate('user', 'name email')
  .populate({
    path: 'orderItems.product',
    select: 'prodName prodPrice customIdentifer',
    populate: {
      path: 'user',  // This will populate the 'user' field of the 'product'
      select: 'name email'
    }
  });

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    // if (order.user.toString() !== req.user._id.toString()) {
    //     res.status(403);
    //     throw new Error('Not authorized to view this order');
    // }

    res.json(order);
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (for supplier)

const getSupplierOrders = async (supplierId) => {
    try {
      // Find products posted by the supplier
      const supplierProducts = await Product.find({ user: supplierId }).sort({date:-1}).select('_id');
      const start = parseInt(req.query.start) || 0;
        const limit = parseInt(req.query.limit) || 10;
      // Extract product IDs
      const productIds = supplierProducts.map(product => product._id);
  
      // Find orders that contain the supplier's products
      const orders = await Order.find({ 'orderItems.product': { $in: productIds } }).sort({date:-1})
        .populate({
          path: 'orderItems.product',
          select: 'prodName prodDesc prodPrice customIdentifer',
        })
        .populate({
          path: 'user',
          select: 'name email',
        }) .skip(start)
        .limit(limit);
  
      return orders;
    } catch (error) {
      console.error(error);
      throw new Error('Error fetching supplier orders');
    }
  }
  ;
  const getSupplierOrderCounts = async (req, res) => {
    try {
      const supplierId = req.userId;
  
      // Find products posted by the supplier
      const supplierProducts = await Product.find({ user: supplierId }).sort({date:-1}).select('_id');
  
      // Extract product IDs
      const productIds = supplierProducts.map(product => product._id);
  
      // Count total orders that contain the supplier's products
      const totalOrders = await Order.countDocuments({ 'orderItems.product': { $in: productIds } });
  
      // Count delivered orders that contain the supplier's products
      const deliveredOrders = await Order.countDocuments({ 
        'orderItems.product': { $in: productIds }, 
        status: 'Delivered' 
      });
  
      res.status(200).json({
        totalOrders,
        deliveredOrders
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching supplier order counts' });
    }
  };
  const getOrderCountsAdmin = async (req, res) => {
    try {
      const supplierId = req.userId;
  
      // Find products posted by the supplier
      const supplierProducts = await Product.find().sort({date:-1}).select('_id');
  
      // Extract product IDs
      const productIds = supplierProducts.map(product => product._id);
  
      // Count total orders that contain the supplier's products
      const totalOrders = await Order.countDocuments({ 'orderItems.product': { $in: productIds } });
  
      // Count delivered orders that contain the supplier's products
      const deliveredOrders = await Order.countDocuments({ 
        'orderItems.product': { $in: productIds }, 
        status: 'Delivered' 
      });
  
      res.status(200).json({
        totalOrders,
        deliveredOrders
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching supplier order counts' });
    }
  };

//   const getSupplierOrdersByStatus = async (supplierId, status) => {
//     try {
//       // Find products posted by the supplier
//       const supplierProducts = await Product.find({ user: supplierId }).select('_id');
  
//       // Extract product IDs
//       const productIds = supplierProducts.map(product => product._id);
  
//       // Find orders that contain the supplier's products with the specified status
//       const orders = await Order.find({
//         'orderItems.product': { $in: productIds },
//         status: status
//       })
//       .populate({
//         path: 'orderItems.product',
//         populate: {
//           path: 'user',
//           select: 'name'
//         },
//         select: 'prodName prodDesc prodPrice user',
//       })
//         .populate({
//           path: 'user',
//           select: 'name email',
//         });
  
//       return orders;
//     } catch (error) {
//       console.error(error);
//       throw new Error('Error fetching supplier orders');
//     }
//   };
// const getSupplierOrdersByStatus = async (supplierId, status, start = 0, limit = 10) => {
//   const supplierProducts = await Product.find({ user: supplierId }).sort({ date: -1 }).select('_id');
//   const productIds = supplierProducts.map(product => product._id);

//   if (!productIds.length) {
//     console.log('No products found for the supplier.');
//     return { totalOrders: 0, orders: [] };
//   }

//   const orders = await Order.find({
//     'orderItems.product': { $in: productIds },
//     status: status,
//   }).sort({ date: -1 })
//     .populate({
//       path: 'orderItems.product',
//       populate: { path: 'user', select: 'name' },
//       select: 'prodName prodDesc prodPrice user customIdentifer',
//     })
//     .populate({ path: 'user', select: 'name email' })
//     .skip(start)
//     .limit(limit);

//   const totalOrders = await Order.countDocuments({
//     'orderItems.product': { $in: productIds },
//     status: status, // Include the status filter
//   });

//   return { totalOrders, orders };
// };

const getSupplierOrdersByStatus = async (req, supplierId, status) => {
  try {
    const start = parseInt(req.query.start) || 0;
    const limit = parseInt(req.query.limit) || 10;

    // Find products associated with the supplier
    const supplierProducts = await Product.find({ user: supplierId }).select('_id');
    const productIds = supplierProducts.map(p => p._id);

    console.log("Supplier Product IDs:", productIds); // Debugging logs

    // Get the total count of orders with 'Pending' status for the supplier's products
    const totalOrders = await Order.countDocuments({
      'orderItems.product': { $in: productIds },
      status,
    });

    // Get the orders with 'Pending' status, sorted by date, with pagination
    const orders = await Order.find({
      'orderItems.product': { $in: productIds },
      status,
    })
      .sort({ date: -1 })  // Sort by most recent date
      .skip(start)         // Pagination start
      .limit(limit)        // Pagination limit
      .populate({
        path: 'orderItems.product',
        select: 'prodName prodDesc prodPrice customIdentifer',
      })
      .populate({
        path: 'user',
        select: 'name email',
      });

    // Return the results
    return { totalOrders, orders };
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching supplier orders');
  }
};


  const getSupplierDeliveredOrders = (supplierId) => {
    return getSupplierOrdersByStatus(supplierId, 'Delivered');
  };
  // Function to update order status
//   const updateOrderStatus = async (supplierId, orderId, newStatus) => {
//     try {
//       // Log the received status for debugging
//       console.log('Received newStatus:', newStatus);
//       console.log('Supplier ID:', supplierId);
//     console.log('Order ID:', orderId);
//     console.log('New Status:', newStatus);
//       // Define valid statuses
//       const validStatuses = ["Pending", "Approved", "Delivered"];
      
//       // Validate the new status
//       if (!validStatuses.includes(newStatus)) {
//         throw new Error('Invalid status');
//       }
  
//       // Find the order by ID
//       const order = await Order.findById(orderId).populate('orderItems.product');
//       if (!order) {
//         throw new Error('Order not found');
//       }
  
//       // Check if the supplier posted the products in the order
//       const supplierProducts = await Product.find({ user: supplierId }).select('_id');
//       const productIds = supplierProducts.map(product => product._id);
  
//       const isOrderValid = order.orderItems.every(item => productIds.includes(item.product._id));
//       if (!isOrderValid) {
//         throw new Error('Order contains products not posted by this supplier');
//       }
  
//       // Update the status of the order using findByIdAndUpdate
//       const updatedOrder = await Order.findByIdAndUpdate(
//         orderId,
//         { status: req.body.newStatus },
//         { new: true, runValidators: true } // Return the updated document and run validators
//       ).populate('orderItems.product')
//        .populate('user'); // Optionally populate user if needed
  
//       if (!updatedOrder) {
//         throw new Error('Failed to update the order status');
//       }
  
//       return updatedOrder;
//     } catch (error) {
//       console.error('Error in updateOrderStatus:', error.message); // Log the error message
//       throw new Error('Error updating order status');
//     }
//   };
// const updateOrderStatus = async (supplierId, orderId, newStatus) => {
//     try {
//       console.log('Received newStatus:', newStatus);
//       console.log('Supplier ID:', supplierId);
//       console.log('Order ID:', orderId);
  
//       const validStatuses = ["Pending", "Approved", "Delivered"];
//       if (!validStatuses.includes(newStatus)) {
//         throw new Error('Invalid status');
//       }
  
//       // Find the order by ID and populate orderItems.product
//       const order = await Order.findById(orderId).populate('orderItems.product');
//       if (!order) {
//         throw new Error('Order not found');
//       }
  
//       // Update the status of the order
//       order.status = newStatus;
//       const updatedOrder = await order.save();
  
//       return updatedOrder;
//     } catch (error) {
//       console.error('Error in updateOrderStatus:', error.message);
//       throw new Error('Error updating order status');
//     }
//   };
  
const updateOrderStatus = async (supplierId, orderId, userId, newStatus) => {
    try {
      // console.log('Received newStatus:', newStatus);
      // console.log('Supplier ID:', supplierId);
      // console.log('Order ID:', orderId);
      // console.log('User ID:', userId);
  
      const validStatuses = ["Pending", "Approved", "Delivered", "Cancelled"];
      if (!validStatuses.includes(newStatus)) {
        throw new Error('Invalid status');
      }
  
      // Find the order by ID and populate orderItems.product
      const order = await Order.findById(orderId).populate('orderItems.product');
      if (!order) {
        throw new Error('Order not found');
      }
  
      // Check if the supplier posted the products in the order
      const supplierProducts = await Product.find({ user: supplierId }).select('_id');
      const productIds = supplierProducts.map(product => product._id);
  
    //   const isOrderValid = order.orderItems.every(item => productIds.includes(item.product._id));
    //   if (!isOrderValid) {
    //     throw new Error('Order contains products not posted by this supplier');
    //   }
  
      // Validate the userId
    //   if (order.buyer.toString() !== userId || order.user.toString() !== userId) {
    //     throw new Error('Order does not belong to the provided user');
    //   }  
  
      // Update the status of the order
      order.status = newStatus;
      const updatedOrder = await order.save();
  
      return updatedOrder;
    } catch (error) {
      console.error('Error in updateOrderStatus:', error.message);
      throw new Error('Error updating order status');
    }
  };
  
  const getOrdersByStatus = async (status, start = 0, limit = 10) => {
    try {
        const supplierProducts = await Product.find().sort({date:-1}).select('_id');
        const productIds = supplierProducts.map(product => product._id);
  
        const orders = await Order.find({
            'orderItems.product': { $in: productIds },
            status: status // Directly use the string status here
        }).sort({ date: -1 })
        .populate({
            path: 'orderItems.product',
            populate: {
                path: 'user',
                select: 'name'
            },
            select: 'prodName prodDesc prodPrice user customIdentifer',
        })
        .populate({
            path: 'user',
            select: 'name email',
        }).skip(start)
        .limit(limit);
        const totalOrders = await Order.countDocuments({
          status: status, // Include the status filter
        });
      
        return { totalOrders, orders };
    } catch (error) {
        console.error('Error fetching supplier orders:', error);
        throw new Error('Error fetching supplier orders');
    }
};



  
  
module.exports = {
    getOrders,
    getOrderByCustomId,
    updateOrderStatus,
    getSupplierOrders,
    getSupplierOrdersByStatus ,
    getSupplierDeliveredOrders,
    getAllOrders,
    getOrdersByStatus,
    getSupplierOrderCounts,
    getOrderCountsAdmin
};
