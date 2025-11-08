// controllers/requestController.js

const Request = require('../database/models/request'); 
const User = require('../database/models/user');
const Notification = require('../database/models/notification');
const ProductSubmission = require('../database/models/productsubmission'); // Import ProductSubmission model
const { getIo, connectedUsers } = require('../socket'); // Import socket functions
const { sendPushNotification } = require('../helper/pushNotifications'); // Import push notification helper
const { sendUnreadCountUpdate } = require('../socket'); // Import sendUnreadCountUpdate


// Function to get all requests along with user details
exports.getAllRequests = async (req, res) => {
    try {
        // Retrieve all requests and populate the user field with selected details
        const requests = await Request.find()
            .populate('user') // Adjust fields as needed
            .sort({ date: -1 }); // Sort by most recent

        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching requests', error });
    }
};

// Create a new request
exports.createRequest = async (req, res) => {
    try {
        const { note } = req.body;
           const userId = req.userId;
        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the user is a Supplier or Buyer
        const requestRole = user.isSupplier ? 'SUPPLIER' : user.isBuyer ? 'BUYER' : 'UNKNOWN';

        // Create a new request
        const request = new Request({
            user: userId,
            note,
            role: requestRole // Optionally, store the role in the request, if needed for future use
        });

        await request.save();

        // Find an admin to notify
        const adminUser = await User.findOne({ isAdmin: true });

        if (adminUser) {
            // Create a new Notification for the admin
            const adminNotification = await Notification.create({
                userId: adminUser._id,
                message: `New request received from ${user.name} (${user.email}).`,
                referenceId: request._id,
                type: 'new_user_request',
            });

            // Send native push notification to admin
            await sendPushNotification(
                adminUser._id,
                'New User Request!',
                adminNotification.message,
                { requestId: request._id.toString(), type: 'new_user_request' }
            );

            // Send Socket.IO notification and update unread count for admin
            const adminSocketId = connectedUsers.get(adminUser._id.toString());
            if (adminSocketId) {
                getIo().to(adminSocketId).emit('notification', adminNotification);
                sendUnreadCountUpdate(adminUser._id.toString());
            }
        } else {
            console.warn('No admin user found to notify about new user request.');
        }
         
        res.status(201).json({ message: 'Request created successfully', request });
    } catch (error) {
        res.status(500).json({ message: 'Error creating request', error });
    }
};

// Function to get completed/delivered products for a supplier
exports.getSupplierDeliveries = async (req, res) => {
    try {
        const supplierId = req.userId; // Assuming req.userId is set by middleware
        if (!supplierId) {
            return res.status(400).json({ message: 'Supplier ID not found in request.' });
        }

        const deliveries = await ProductSubmission.find({
            supplier: supplierId,
            status: 'Delivered' // Only fetching delivered products for "deliveries"
        })
        .populate('requirement') // Populate related requirement details if needed
        .populate('supplier', 'name customIdentifier') // Populate supplier details
        .sort({ date: -1 });

        console.log('Fetched supplier deliveries:', deliveries); // Add this line
        res.status(200).json(deliveries);
    } catch (error) {
        console.error('Error fetching supplier deliveries:', error);
        res.status(500).json({ message: 'Error fetching supplier deliveries', error: error.message });
    }
};
