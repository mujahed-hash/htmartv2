const ServiceOrder = require('../database/models/serviceOrder');
const { Service } = require('../database/models/service');
const User = require('../database/models/user');
const Notification = require('../database/models/notification'); // Import Notification model
const slugify = require('slugify');
const mongoose = require('mongoose');

// Create a new service order
exports.createServiceOrder = async (req, res) => {
    try {
        console.log('==== CREATE SERVICE ORDER ====');
        console.log('Request body:', req.body);
        
        const userId = req.userId;
        console.log('User ID from token:', userId);
        
        const { 
            serviceId, 
            name, 
            email, 
            phone, 
            address, 
            quantity, 
            notes,
            supplierId
        } = req.body;

        console.log('Service ID:', serviceId);
        console.log('Supplier ID from request:', supplierId);

        if (!userId) {
            console.error('No user ID in token');
            return res.status(401).json({ error: 'User not authenticated.' });
        }

        // Find the service
        console.log('Finding service with ID:', serviceId);
        const service = await Service.findById(serviceId).select('serviceName serviceDesc price images user isActive isApproved');
        
        if (!service) {
            console.error('Service not found with ID:', serviceId);
            return res.status(404).json({ error: 'Service not found.' });
        }
        
        console.log('Service found:', {
            id: service._id,
            name: service.serviceName,
            user: service.user
        });

        // Check if service is active and approved
        if (!service.isActive || !service.isApproved) {
            console.error('Service is not active or approved');
            return res.status(400).json({ error: 'Service is not available for ordering.' });
        }

        // If supplierId is not provided, get it from the service
        let supplierIdToUse = supplierId;
        if (!supplierIdToUse) {
            // If supplierId is not provided, use the service.user field
            supplierIdToUse = service.user;
            console.log('Using supplier ID from service:', supplierIdToUse);
            
            // Check if service.user is a string or an object
            if (typeof supplierIdToUse === 'object' && supplierIdToUse !== null) {
                console.log('Service user is an object:', supplierIdToUse);
                supplierIdToUse = supplierIdToUse._id || supplierIdToUse.id;
                console.log('Extracted ID from service user object:', supplierIdToUse);
            }
        }
        
        console.log('Final supplier ID to use:', supplierIdToUse);

        // Check if supplier exists
        console.log('Finding supplier with ID:', supplierIdToUse);
        let supplier = null;
        
        // Try to find supplier by ID
        if (supplierIdToUse) {
            try {
                supplier = await User.findById(supplierIdToUse);
                if (supplier) {
                    console.log('Supplier found by ID:', {
                        id: supplier._id,
                        name: supplier.name
                    });
                } else {
                    console.log('Supplier not found with ID:', supplierIdToUse);
                }
            } catch (error) {
                console.error('Error finding supplier by ID:', error.message);
            }
        }
        
        // If supplier not found by ID, try to find by service's user reference
        if (!supplier && service.user) {
            console.log('Trying to find supplier by service.user reference');
            
            try {
                // If service.user is already an object with _id
                if (typeof service.user === 'object' && service.user !== null && service.user._id) {
                    console.log('Finding supplier by service.user._id:', service.user._id);
                    supplier = await User.findById(service.user._id);
                } 
                // If service.user is a string (ObjectId)
                else if (typeof service.user === 'string' || 
                        (typeof service.user === 'object' && service.user !== null && service.user.toString)) {
                    const userId = typeof service.user === 'string' ? service.user : service.user.toString();
                    console.log('Finding supplier by service.user as string:', userId);
                    supplier = await User.findById(userId);
                }
                
                if (supplier) {
                    console.log('Supplier found by service.user reference:', {
                        id: supplier._id,
                        name: supplier.name
                    });
                }
            } catch (error) {
                console.error('Error finding supplier by service.user reference:', error.message);
            }
        } else {
            console.log('Service has null user reference or supplier already found');
        }
        
        // Final fallback: try to find any admin or superadmin user to assign as supplier
        if (!supplier) {
            console.log('Trying to find any admin/superadmin user as fallback supplier');
            try {
                // First try to find an admin
                supplier = await User.findOne({ isAdmin: true });
                
                if (supplier) {
                    console.log('Admin user found as fallback supplier:', {
                        id: supplier._id,
                        name: supplier.name
                    });
                } else {
                    // If no admin found, try to find a superadmin
                    supplier = await User.findOne({ isSuperAdmin: true });
                    
                    if (supplier) {
                        console.log('SuperAdmin user found as fallback supplier:', {
                            id: supplier._id,
                            name: supplier.name
                        });
                    } else {
                        // Last resort: find any user
                        supplier = await User.findOne({});
                        
                        if (supplier) {
                            console.log('Random user found as last resort fallback supplier:', {
                                id: supplier._id,
                                name: supplier.name
                            });
                        }
                    }
                }
            } catch (error) {
                console.error('Error finding fallback supplier:', error.message);
            }
        }
        
        // If still no supplier found, return error
        if (!supplier) {
            console.error('No supplier found after all fallback attempts');
            return res.status(404).json({ error: 'Supplier not found. Please contact support.' });
        }

        // Calculate total price
        const totalPrice = service.price * quantity;

        // Generate a custom identifier
        const timestamp = Date.now();
        const customIdentifier = `order-service-${timestamp}`;

        console.log('Generated Order Custom Identifier:', customIdentifier);

        // Create the service order
        const serviceOrder = new ServiceOrder({
            service: serviceId,
            user: userId,
            supplier: supplier._id, // Use the found supplier
            customerInfo: {
                name,
                email,
                phone,
                address
            },
            quantity,
            notes,
            price: service.price,
            totalPrice,
            customIdentifier,
            conversation: notes ? [{ sender: userId, role: 'user', message: notes }] : [] // Initialize conversation with notes if provided
        });

        // Save the service order
        await serviceOrder.save();

        // --- Notification Logic ---
        const notificationsToCreate = [];

        // Fetch the user (buyer) who placed the order to get their name
        const buyer = await User.findById(userId).select('name');
        const buyerName = buyer ? buyer.name : 'Unknown User';

        // 1. Notification to the user who made the order (buyer) - only if not the same as supplier
        if (userId !== supplier._id.toString()) {
            notificationsToCreate.push({
                userId: userId,
                message: `Your order for '${service.serviceName}' has been placed successfully. Order ID: ${customIdentifier}.`,
                orderIdentifier: customIdentifier,
                isRead: false,
                adminRead: false,
                type: 'service-order' // Add type for service order notification
            });
        }

        // 2. Notification to the supplier (user who created the service) - only if not the same as buyer
        if (supplier._id.toString() !== userId) {
            notificationsToCreate.push({
                userId: supplier._id, // Supplier's ID
                message: `New service order for your service '${service.serviceName}' from ${buyerName}. Order ID: ${customIdentifier}.`,
                orderIdentifier: customIdentifier,
                isRead: false,
                adminRead: false,
                type: 'service-order' // Add type for service order notification
            });
        }

        // 3. Notifications to all unique admins/superadmins (excluding buyer and supplier)
        console.log('Finding all admins...');
        const allAdmins = await User.find({ $or: [{ isAdmin: true }, { isSuperAdmin: true }] }).select('_id');
        console.log(`Found ${allAdmins.length} admin users:`, allAdmins.map(a => a._id.toString()));
        const uniqueAdminIds = new Set(allAdmins.map(admin => admin._id.toString()));

        // Check for existing notifications for this order to prevent duplicates
        console.log('Checking for existing notifications for order:', customIdentifier);
        const existingNotifications = await Notification.find({ orderIdentifier: customIdentifier, type: 'service-order' });
        console.log(`Found ${existingNotifications.length} existing notifications for this order`);
        const notifiedAdminIds = new Set(existingNotifications.map(notif => notif.userId.toString()));

        uniqueAdminIds.forEach(adminId => {
            // Skip if this admin is the buyer, supplier, or already notified
            if (adminId !== userId && adminId !== supplier._id.toString() && !notifiedAdminIds.has(adminId)) {
                console.log('Creating notification for admin ID:', adminId);
                notificationsToCreate.push({
                    userId: new mongoose.Types.ObjectId(adminId),
                    message: `A new service order (${service.serviceName}) has been placed by ${buyerName}. Order ID: ${customIdentifier}.`,
                    orderIdentifier: customIdentifier,
                    isRead: false,
                    adminRead: true,
                    type: 'service-order'
                });
            } else {
                console.log('Skipping notification for admin ID:', adminId, 'Reason:', adminId === userId ? 'is buyer' : adminId === supplier._id.toString() ? 'is supplier' : 'already notified');
            }
        });

        // Save all notifications
        if (notificationsToCreate.length > 0) {
            await Notification.insertMany(notificationsToCreate);
            console.log(`Created ${notificationsToCreate.length} notifications for service order ${customIdentifier}.`);
        }
        // --- End Notification Logic ---

        res.status(201).json({
            success: true,
            message: 'Service order created successfully.',
            order: serviceOrder
        });
    } catch (error) {
        console.error('Error creating service order:', error);
        res.status(500).json({ error: 'Server error while creating service order.', details: error.message });
    }
};

// Get service orders for a user
exports.getUserServiceOrders = async (req, res) => {
    try {
        console.log('=== getUserServiceOrders called ===');
        console.log('User ID:', req.userId);
        console.log('Query params:', req.query);
        
        const userId = req.userId;

        if (!userId) {
            console.log('No user ID found');
            return res.status(401).json({ error: 'User not authenticated.' });
        }

        // Get pagination parameters from query
        const start = parseInt(req.query.start) || 0;
        const limit = parseInt(req.query.limit) || 20;
        
        console.log('Pagination params - start:', start, 'limit:', limit);

        // Get total count for pagination
        const totalCount = await ServiceOrder.countDocuments({ user: userId });
        console.log('Total count:', totalCount);

        // Get orders with pagination
        const orders = await ServiceOrder.find({ user: userId })
            .populate('service', 'serviceName images price customIdentifier')
            .populate('supplier', 'name')
            .sort({ date: -1 })
            .skip(start)
            .limit(limit);

        console.log('Found orders:', orders.length);

        // Calculate pagination info
        const hasMore = start + limit < totalCount;

        const response = {
            success: true,
            orders,
            pagination: {
                totalCount,
                hasMore,
                currentPage: Math.floor(start / limit) + 1,
                totalPages: Math.ceil(totalCount / limit)
            }
        };
        
        console.log('Sending response:', response);
        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching user service orders:', error);
        res.status(500).json({ error: 'Server error while fetching service orders.', details: error.message });
    }
};

// Get service orders for a supplier
exports.getSupplierServiceOrders = async (req, res) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated.' });
        }

        const orders = await ServiceOrder.find({ supplier: userId })
            .populate('service', 'serviceName images price customIdentifier')
            .populate('user', 'name')
            .sort({ date: -1 });

        res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        console.error('Error fetching supplier service orders:', error);
        res.status(500).json({ error: 'Server error while fetching service orders.', details: error.message });
    }
};

// Get a single service order by customIdentifier
exports.getServiceOrderById = async (req, res) => {
    try {
        const { customIdentifier } = req.params; // Changed to customIdentifier
        const userId = req.userId;
        const user = req.user; 

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated.' });
        }

        const order = await ServiceOrder.findOne({ customIdentifier })
            .populate('service', 'serviceName serviceDesc images price customIdentifier')
            .populate('user', 'name email customIdentifier image')
            .populate('supplier', 'name email customIdentifier image')
            .populate('conversation.sender', 'name customIdentifier image'); 

        if (!order) {
            return res.status(404).json({ error: 'Service order not found.' });
        }

        // Check if user is authorized to view this order
        if (order.user._id.toString() !== userId && order.supplier._id.toString() !== userId && !user.isAdmin && !user.isSuperAdmin) {
            return res.status(403).json({ error: 'You are not authorized to view this order.' });
        }

        res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        console.error('Error fetching service order:', error);
        res.status(500).json({ error: 'Server error while fetching service order.', details: error.message });
    }
};

// Add a message to a service order's conversation
exports.addMessageToServiceOrder = async (req, res) => {
    try {
        const { customIdentifier } = req.params; // Changed to customIdentifier
        const { message, newStatus } = req.body;
        const userId = req.userId;
        const user = req.user; 

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated.' });
        }

        if (!message) {
            return res.status(400).json({ error: 'Message content is required.' });
        }

        const order = await ServiceOrder.findOne({ customIdentifier }); // Changed to findOne by customIdentifier
        if (!order) {
            return res.status(404).json({ error: 'Service order not found.' });
        }

        // Determine sender role
        let role;
        if (order.user._id.toString() === userId) {
            role = 'user';
        } else if (order.supplier._id.toString() === userId) {
            role = 'supplier';
        } else if (user.isAdmin || user.isSuperAdmin) {
            role = 'admin';
        } else {
            return res.status(403).json({ error: 'You are not authorized to add messages to this order.' });
        }

        // Create new message object
        const newMessage = {
            sender: userId,
            role: role,
            message: message,
            timestamp: new Date()
        };

        order.conversation.push(newMessage);

        // Optionally update status based on who sent the message or a provided newStatus
        if (newStatus) {
            order.status = newStatus; 
        } else if (role === 'admin' || role === 'supplier') {
            if (order.status === 'awaiting_admin_action') {
                order.status = 'awaiting_user_response';
            }
        } else if (role === 'user') {
            if (order.status === 'awaiting_user_response') {
                order.status = 'awaiting_admin_action';
            }
        }

        await order.save();

        // Re-fetch and populate the order to ensure all conversation messages have populated senders
        const updatedOrder = await ServiceOrder.findOne({ customIdentifier })
            .populate('service', 'serviceName serviceDesc images price customIdentifier')
            .populate('user', 'name email customIdentifier image')
            .populate('supplier', 'name email customIdentifier image')
            .populate('conversation.sender', 'name customIdentifier image')
            .lean();

        if (!updatedOrder) {
            return res.status(404).json({ error: 'Service order not found after update.' });
        }

        res.status(200).json({
            success: true,
            message: 'Message added to service order conversation.',
            order: updatedOrder,
            newMessage: updatedOrder.conversation[updatedOrder.conversation.length - 1] // Return the last message with populated sender
        });

    } catch (error) {
        console.error('Error adding message to service order:', error);
        res.status(500).json({ error: 'Server error while adding message to service order.', details: error.message });
    }
};

// Update service order status (can be used by admin/supplier)
exports.updateServiceOrderStatus = async (req, res) => {
    try {
        const { customIdentifier } = req.params; // Changed to customIdentifier
        const { status } = req.body;
        const userId = req.userId;
        const user = req.user; 

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated.' });
        }

        const order = await ServiceOrder.findOne({ customIdentifier }); // Changed to findOne by customIdentifier
        if (!order) {
            return res.status(404).json({ error: 'Service order not found.' });
        }

        // Check if user is authorized to update this order (supplier or admin/superadmin)
        if (order.supplier.toString() !== userId && !user.isAdmin && !user.isSuperAdmin) {
            return res.status(403).json({ error: 'You are not authorized to update this order.' });
        }

        // Validate new status against allowed enum values
        const allowedStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'awaiting_user_response', 'awaiting_admin_action'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status provided.' });
        }

        // Update the status
        order.status = status;
        await order.save();

        res.status(200).json({
            success: true,
            message: 'Service order status updated successfully.',
            order
        });
    } catch (error) {
        console.error('Error updating service order status:', error);
        res.status(500).json({ error: 'Server error while updating service order status.', details: error.message });
    }
};

// Cancel a service order
exports.cancelServiceOrder = async (req, res) => {
    try {
        const { customIdentifier } = req.params; // Changed to customIdentifier
        const userId = req.userId;
        const user = req.user; 

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated.' });
        }

        const order = await ServiceOrder.findOne({ customIdentifier }); // Changed to findOne by customIdentifier
        if (!order) {
            return res.status(404).json({ error: 'Service order not found.' });
        }

        // Check if user is authorized to cancel this order
        if (order.user._id.toString() !== userId && !user.isAdmin && !user.isSuperAdmin) {
            return res.status(403).json({ error: 'You are not authorized to cancel this order.' });
        }

        // Check if order can be cancelled
        if (order.status === 'completed' || order.status === 'cancelled') {
            return res.status(400).json({ error: 'This order cannot be cancelled as it is already completed or cancelled.' });
        }

        // Update the status
        order.status = 'cancelled';
        await order.save();

        res.status(200).json({
            success: true,
            message: 'Service order cancelled successfully.',
            order
        });
    } catch (error) {
        console.error('Error cancelling service order:', error);
        res.status(500).json({ error: 'Server error while cancelling service order.', details: error.message });
    }
};
