const Requirement = require('../database/models/requirements');
const User = require('../database/models/user');
const ProductSubmission = require('../database/models/productsubmission');
const Notification = require('../database/models/notification');
const slugify = require('slugify');
const { connectedUsers, getIo } = require('../socket'); // Import connectedUsers and getIo

// Post a new requirement by the buyer
const postRequirement = async (req, res) => {
    try {
        const { reqDetails } = req.body;

        // Find the buyer by their ID
        const buyer = await User.findById(req.userId);

        // Check if the user is a buyer
        if (!buyer || !buyer.isBuyer) {
            return res.status(403).json({ message: 'Unauthorized. Only buyers can post requirements.' });
        }


        const randomComponent = Date.now().toString(); // You can replace this with your own logic
        const customIdentifier = `${slugify(reqDetails.slice(0,5), { lower: true })}-${randomComponent}`;
        // Create a new requirement object
        const newRequirement = new Requirement({
            reqDetails,
            customIdentifier,
            buyer: req.userId,  // Assign the buyer's ID to the requirement
            status: 'Pending'   // Default status when requirement is created
        });

        // Save the new requirement to the database
        const savedRequirement = await newRequirement.save();

        // Notify the admin about the new requirement
      const buyerNotification =  await Notification.create({
            userId: buyer._id,  // This can be an Admin's userId instead
            message: `A new requirement has been posted by buyer ${buyer.name}.`,
            requirementIdentifier:customIdentifier,
            referenceId: savedRequirement._id  // Reference to the requirement
        });
        const [buyerUnreadCount] = await Promise.all([
            Notification.countDocuments({ userId:buyer._id, isRead: false }),
        ]);
    
        const buyerSocketId = connectedUsers.get(buyer._id.toString());
        // const supplierSocketId = connectedUsers.get(supplier?._id.toString());
    
        const io = getIo(); // Get io instance from socket.js
    
        if (buyerSocketId) {
            io.to(buyerSocketId).emit('notification', buyerNotification);
            io.to(buyerSocketId).emit('unreadCountUpdate', buyerUnreadCount);
            console.log(io.to(buyerSocketId).emit('unreadCountUpdate', buyerUnreadCount))
    
        }
    
        // if (supplierSocketId) {
        //     io.to(supplierSocketId).emit('notification', supplierNotification);
        //     io.to(supplierSocketId).emit('unreadCountUpdate', supplierUnreadCount);
        //     console.log(io.to(supplierSocketId).emit('unreadCountUpdate', supplierUnreadCount)
        // )
        // }

        // Respond with a success message and the saved requirement
        res.status(201).json({ message: 'Requirement posted successfully.', requirement: savedRequirement });
    } catch (error) {
        // Handle any errors that occur during the process
        res.status(500).json({ message: 'Error posting requirement.', error });
    }
};


// const forwardRequirementToSuppliers = async (req, res) => {
//     try {
//         const { requirementId } = req.body;

//         const requirement = await Requirement.findById(requirementId);

//         if (!requirement) {
//             return res.status(404).json({ message: 'Requirement not found.' });
//         }

//         // Find all suppliers
//         const suppliers = await User.find({ isSupplier: true });

//         if (!suppliers.length) {
//             return res.status(404).json({ message: 'No suppliers found.' });
//         }

//         // Update the requirement to include forwarded suppliers and mark as forwarded
//         requirement.forwardedTo = suppliers.map(supplier => supplier._id);
//         requirement.status = 'Forwarded';
//         await requirement.save();
//          var supp;
//         // Notify each supplier
//         const supplierNotification =   suppliers.forEach(async (supplier) => {
//              supp = supplier;
//             await Notification.create({
//                 userId: supplier._id,
//                 message: `A new requirement has been forwarded to you by admin for buyer.`,
//                 referenceId: requirement._id,
//                 requirementIdentifier:requirement.customIdentifier,

//             });
//         });
//         const [supplierUnreadCount] = await Promise.all([
//             Notification.countDocuments({ userId:buyer._id, isRead: false }),
//         ]);
//         const io = getIo(); // Get io instance from socket.js
//         const supplierSocketId = connectedUsers.get(supp._id.toString());

//         if (supplierSocketId) {
//             io.to(supplierSocketId).emit('notification', supplierNotification);
//             io.to(supplierSocketId).emit('unreadCountUpdate', supplierUnreadCount);
//             console.log(io.to(supplierSocketId).emit('unreadCountUpdate', supplierUnreadCount))
    
//         }
    
//         res.status(200).json({ message: 'Requirement forwarded to suppliers successfully.' });
//     } catch (error) {
//         res.status(500).json({ message: 'Error forwarding requirement.', error });
//     }
// };
const forwardRequirementToSuppliers = async (req, res) => {
    try {
        const { requirementId } = req.body;

        // Find the requirement by ID
        const requirement = await Requirement.findById(requirementId);
        if (!requirement) {
            return res.status(404).json({ message: 'Requirement not found.' });
        }

        // Find all suppliers
        const suppliers = await User.find({ isSupplier: true });
        if (!suppliers.length) {
            return res.status(404).json({ message: 'No suppliers found.' });
        }

        // Update the requirement with forwarded suppliers and status
        const supplierIds = suppliers.map(supplier => supplier._id);
        requirement.forwardedTo = supplierIds;
        requirement.status = 'Forwarded';
        await requirement.save();

        // Notify suppliers
        const notifications = suppliers.map(supplier => ({
            userId: supplier._id,
            message: 'A new requirement has been forwarded to you by admin for buyer.',
            referenceId: requirement._id,
            requirementIdentifier: requirement.customIdentifier,
        }));
        await Notification.insertMany(notifications);

        // Broadcast notifications via sockets
        const io = getIo(); // Get io instance from socket.js
        for (const supplier of suppliers) {
            const supplierSocketId = connectedUsers.get(supplier._id.toString());
            if (supplierSocketId) {
                const unreadCount = await Notification.countDocuments({
                    userId: supplier._id,
                    isRead: false,
                });
                io.to(supplierSocketId).emit('notification', {
                    message: `A new requirement has been forwarded to you.`,
                });
                io.to(supplierSocketId).emit('unreadCountUpdate', unreadCount);
            }
        }

        res.status(200).json({ message: 'Requirement forwarded to suppliers successfully.' });
    } catch (error) {
        console.error('Error forwarding requirement:', error);
        res.status(500).json({ message: 'Error forwarding requirement.', error });
    }
};

const getForwardedRequirementsForSupplier = async (req, res) => {
    try {
        const supplierId = req.userId;

        // Find all requirements where the supplier is in the forwardedTo list
        const requirements = await Requirement.find({ forwardedTo: supplierId, status: { $in: ['Pending', 'Forwarded'] }  // Finds products with status either 'Delivered' or 'Completed'
    });

        // Map through the requirements to add a 'hasPosted' flag
        const requirementsWithPostedFlag = requirements.map(requirement => {
            const hasPosted = requirement.productDetails.some(detail => detail.supplier.toString() === supplierId.toString());
            return {
                ...requirement.toObject(), // Convert mongoose document to plain object
                hasPosted // Add the flag to the requirement object
            };
        });

        res.status(200).json(requirementsWithPostedFlag);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching forwarded requirements.', error });
    }
};

const getCompletedRequirementsForSupplier = async (req, res) => {
    try {
        const supplierId = req.userId;

        // Find all requirements where the supplier is in the forwardedTo list
        const requirements = await Requirement.find({ forwardedTo: supplierId,            
             status: { $in: ['Delivered', 'Completed'] }  // Finds products with status either 'Delivered' or 'Completed'
    });

        // Map through the requirements to add a 'hasPosted' flag
        const requirementsWithPostedFlag = requirements.map(requirement => {
            const hasPosted = requirement.productDetails.some(detail => detail.supplier.toString() === supplierId.toString());
            return {
                ...requirement.toObject(), // Convert mongoose document to plain object
                hasPosted // Add the flag to the requirement object
            };
        });

        res.status(200).json(requirementsWithPostedFlag);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching forwarded requirements.', error });
    }
};


const postProductInfo = async (req, res) => {
    try {
        const { requirementId, name, price } = req.body;
        const image = req.file ? `${req.protocol}://${req.get('host')}/uploads/requirements/${req.file.filename}` : '';

        // Find the requirement by ID
        const requirement = await Requirement.findById(requirementId);

        if (!requirement) {
            return res.status(404).json({ message: 'Requirement not found.' });
        }

        // Verify the user is a supplier
        const supplier = await User.findById(req.userId);
        if (!supplier || !supplier.isSupplier) {
            return res.status(403).json({ message: 'Unauthorized. You must be a supplier to post product information.' });
        }

        // Check if the supplier has already submitted a product for this requirement
        const existingSubmission = await ProductSubmission.findOne({ requirement: requirementId, supplier: supplier._id });
        if (existingSubmission) {
            return res.status(400).json({ message: 'You have already submitted product information for this requirement.' });
        }

        // Create a new product submission
        const newProductSubmission = new ProductSubmission({
            requirement: requirement._id,
            supplier: supplier._id,
            name,
            price,
            image
        });

        await newProductSubmission.save();

        // Notify the admin
        await Notification.create({
            userId: supplier._id,
            message: `Product information posted by supplier ${supplier.name} for requirement ${requirement.customIdentifier}.`,
            requirementIdentifier:requirement?.customIdentifier,

        });

        res.status(200).json({ message: 'Product information posted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error posting product information.', error });
    }
};




const selectProductForDelivery = async (req, res) => {
    try {
        const { requirementId, productId } = req.body;

        const requirement = await Requirement.findById(requirementId);

        if (!requirement) {
            return res.status(404).json({ message: 'Requirement not found.' });
        }

        if (requirement.buyer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized.' });
        }

        requirement.selectedProduct.productId = productId;
        requirement.status = 'Pending Delivery';
        await requirement.save();

        // Notify admin
        Notification.create({
            userId: requirement.buyer,
            message: `Product selected for delivery: ${productId}.`,
            requirementIdentifier:requirement?.customIdentifier,


        });

        res.status(200).json({ message: 'Product selected for delivery successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error selecting product for delivery.', error });
    }
};

// Forward product information from suppliers to the buyer
const forwardProductInfoToBuyer = async (req, res) => {
    try {
        const { submissionId } = req.body;

        // Find the product submission by ID
        const productSubmission = await ProductSubmission.findById(submissionId).populate('requirement supplier')

        if (!productSubmission) {
            return res.status(404).json({ message: 'Product submission not found.' });
        }

        // Verify the user is an admin
        const admin = await User.findById(req.userId);
        if (!admin || !admin.isAdmin) {
            return res.status(403).json({ message: 'Unauthorized. You must be an admin to forward product information.' });
        }

        // Update submission status to 'Forwarded'
        productSubmission.status = 'Forwarded';
        await productSubmission.save();

        // Update the requirement's productDetails array
        const requirement = await Requirement.findById(productSubmission.requirement._id);
        requirement.productDetails.push({
            name: productSubmission.name,
            price: productSubmission.price,
            image: productSubmission.image,
            prodStatus: productSubmission.status,
            supplier: productSubmission.supplier._id
        });
        await requirement.save();

        // Notify the buyer
        await Notification.create({
            userId: productSubmission.requirement.buyer,
            message: `Product information for your requirement ${productSubmission.requirement.customIdentifier} has been forwarded by an admin.`,
            requirementIdentifier:requirement?.customIdentifier,

        });

        res.status(200).json({ message: 'Product information forwarded to the buyer successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error forwarding product information.', error });
    }
};

const confirmDelivery = async (req, res) => {
    try {
        const { submissionId } = req.body;

        // Find the product submission and populate the related fields
        const productSubmission = await ProductSubmission.findById(submissionId)
            .populate('requirement')
            .populate('supplier');

        if (!productSubmission) {
            return res.status(404).json({ message: 'Product submission not found.' });
        }

        // Find the associated requirement
        const requirement = await Requirement.findById(productSubmission.requirement._id);
        if (!requirement) {
            return res.status(404).json({ message: 'Requirement not found.' });
        }

        // Update the status of the requirement and product submission
        productSubmission.status = 'Completed';
        await productSubmission.save();

        requirement.status = 'Completed';
        await requirement.save();

        // Notify the supplier about the confirmed delivery
        await Notification.create({
            userId: productSubmission.supplier._id,
            message: `Delivery for product ${productSubmission.name} has been confirmed by the admin.`,
            requirementIdentifier:requirement?.customIdentifier,

        });

        // Notify the buyer about the confirmed delivery
        await Notification.create({
            userId: requirement.buyer._id,
            message: `Your delivery for product ${productSubmission.name} has been confirmed.`,
            requirementIdentifier:requirement?.customIdentifier,

        });

        res.status(200).json({ message: 'Delivery confirmed successfully.' });
    } catch (error) {
        console.error('Error confirming delivery:', error); // Log the error for debugging
        res.status(500).json({ message: 'Error confirming delivery.', error });
    }
};

const markRequirementAsCompleted = async (req, res) => {
    try {
        const { requirementId } = req.body;

        const requirement = await Requirement.findById(requirementId);

        if (!requirement) {
            return res.status(404).json({ message: 'Requirement not found.' });
        }

        if (requirement.buyer.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            return res.status(403).json({ message: 'Unauthorized.' });
        }

        if (requirement.status !== 'Pending Delivery') {
            return res.status(400).json({ message: 'Requirement is not ready for completion.' });
        }

        requirement.status = 'Completed';
        await requirement.save();

        Notification.create({
            userId: requirement.buyer,
            message: `Your requirement ${requirementId} has been marked as completed.`,
            requirementIdentifier:requirement?.customIdentifier,

        });

        requirement.suppliers.forEach(supplierId => {
            Notification.create({
                userId: supplierId,
                message: `Requirement ${requirementId} has been marked as completed.`,
                requirementIdentifier:requirement?.customIdentifier,

            });
        });

        res.status(200).json({ message: 'Requirement marked as completed successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error marking requirement as completed.', error });
    }
};

const RequestDelivery = async (req, res) => {
    try {
        const { requirementId, submissionId } = req.body;

        // Find the requirement
        const requirement = await Requirement.findById(requirementId);
        if (!requirement || requirement.buyer.toString() !== req.userId) {
            return res.status(404).json({ message: 'Requirement not found or not owned by the buyer.' });
        }

        // Find the product submission
        const productSubmission = await ProductSubmission.findById(submissionId);
        if (!productSubmission) {
            return res.status(404).json({ message: 'Product submission not found.' });
        }

        // Update the status of the requirement
        requirement.status = 'Requested';
        await requirement.save();

        // Update the status of the product submission
        productSubmission.status = 'Requested';
        await productSubmission.save();

        // Notify the admin about the delivery request
        await Notification.create({
            userId: requirement.admin, // Assuming the admin is notified
            message: `Buyer has requested delivery for product ${productSubmission.name}.`,
            requirementIdentifier:requirement?.customIdentifier,

        });

        res.status(200).json({ message: 'Delivery request submitted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error requesting delivery.', error });
    }
};



const getRequestedSubmissions = async (req, res) => {
    try {
        // Fetch all product submissions that are requested for delivery
        const requestedSubmissions = await ProductSubmission.find({ status: 'Requested' })
            .populate({
                path: 'requirement',
                populate: [
                    {
                        path: 'buyer',
                        select: 'name email phone street apartment city zip country', // Select buyer fields
                    },
                    {
                        path: 'productDetails.supplier',
                        select: 'name email phone street apartment city zip country', // Select supplier fields
                    },
                ],
            })
            .populate('supplier', 'name email phone street apartment city zip country'); // Populating supplier details directly from the product submission

        res.status(200).json(requestedSubmissions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching requested submissions.', error });
    }
};

const getCompletedProductsForSupplier = async (req, res) => {
    try {
        const supplierId = req.userId; // Assuming the supplier is authenticated and their ID is available

        const completedProducts = await ProductSubmission.find({ 
            supplier: supplierId, 
            status: 'Completed' 
        }).populate('requirement', 'buyer reqDetails customIdentifier')
          .populate('requirement.buyer', 'name phone email street city zip country');  // Populating buyer details

        if (!completedProducts.length) {
            return res.status(404).json({ message: 'No completed products found.' });
        }

        res.status(200).json(completedProducts);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving completed products.', error });
    }
};
const getDeliveredProductsForSupplier = async (req, res) => {
    try {
        const supplierId = req.userId; // Assuming the supplier is authenticated and their ID is available

        const completedProducts = await ProductSubmission.find({ 
            supplier: supplierId, 
            status: { $in: ['Delivered', 'Completed'] }  // Finds products with status either 'Delivered' or 'Completed'

        }).populate('requirement', 'buyer reqDetails customIdentifier')
          .populate('requirement.buyer', 'name phone email street city zip country');  // Populating buyer details

        if (!completedProducts.length) {
            return res.status(404).json({ message: 'No completed products found.' });
        }

        res.status(200).json(completedProducts);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving completed products.', error });
    }
};
const getDeliveredProductsForAdmin = async (req, res) => {
    try {
      const supplierId = req.userId; // Supplier's ID from authentication
  
      const completedProducts = await ProductSubmission.find({
        status: { $in: ['Delivered', 'Completed'] }
      })
        .populate({
          path: 'requirement',
          select: 'buyer reqDetails customIdentifier',
          populate: {
            path: 'buyer',
            select: 'name phone email street city zip country'
          }
        })
        .populate({
          path: 'supplier',
          select: 'name email phone street city zip country'
        });
  
      if (!completedProducts.length) {
        return res.status(404).json({ message: 'No completed products found.' });
      }
  
      res.status(200).json(completedProducts);
    } catch (error) {
      console.error('Error retrieving completed products:', error);
      res.status(500).json({ message: 'Error retrieving completed products.', error });
    }
  };
  
// Example route to get requested submissions

const updateStatusToDelivered = async (req, res) => {
    try {
        const { requirementId, submissionId } = req.body;

        // Verify the user is an admin
        const admin = await User.findById(req.userId);
        if (!admin || !admin.isAdmin) {
            return res.status(403).json({ message: 'Unauthorized. You must be an admin to update the status.' });
        }

        // Find the requirement by ID
        const requirement = await Requirement.findById(requirementId);
        if (!requirement) {
            return res.status(404).json({ message: 'Requirement not found.' });
        }

        // Find the product submission by ID
        const productSubmission = await ProductSubmission.findById(submissionId);
        if (!productSubmission) {
            return res.status(404).json({ message: 'Product submission not found.' });
        }
  // Notify the buyer about the confirmed delivery
  await Notification.create({
    userId: requirement.buyer._id,
    message: `Your delivery for product ${productSubmission.name} has been delivered.`,
    requirementIdentifier:requirement?.customIdentifier,

});
        // Update the statuses to 'Delivered'
        requirement.status = 'Delivered';
        await requirement.save();

        productSubmission.status = 'Delivered';
        await productSubmission.save();

        res.status(200).json({ message: 'Status updated to Delivered successfully.' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error updating status to Delivered.', error });
    }
};



module.exports = {
    postRequirement,
    selectProductForDelivery,
    forwardProductInfoToBuyer,
    forwardRequirementToSuppliers,
    markRequirementAsCompleted,
    postProductInfo,
    forwardProductInfoToBuyer,
    getForwardedRequirementsForSupplier,
    RequestDelivery,
    confirmDelivery,
    getRequestedSubmissions,
    getCompletedProductsForSupplier,
    getDeliveredProductsForSupplier,
    getDeliveredProductsForAdmin,
    updateStatusToDelivered,
    getCompletedRequirementsForSupplier
};
