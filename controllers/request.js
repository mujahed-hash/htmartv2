// controllers/requestController.js

const Request = require('../database/models/request'); 
const User = require('../database/models/user');
const Notification = require('../database/models/notification');


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
          await Notification.create({
            userId: userId,
            message: `A request has been posted.`,
        
        });
         
        res.status(201).json({ message: 'Request created successfully', request });
    } catch (error) {
        res.status(500).json({ message: 'Error creating request', error });
    }
};
