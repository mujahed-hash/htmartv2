const express = require('express');
const router = express.Router();
const Requirement = require('../database/models/requirements');
const roleMiddleware = require('../helper/roles')
const middleware = require('../helper/middleware');
const upload  = require('../multer/reqMulter');
const User = require('../database/models/user');
const Notification = require('../database/models/notification');

const { postRequirement, selectProductForDelivery, markRequirementAsCompleted,confirmDelivery,
    forwardProductInfo,   RequestDelivery,
    forwardRequirementToSuppliers, updateStatusToDelivered,
    postProductInfo, forwardProductInfoToBuyer, getDeliveredProductsForSupplier,
     getForwardedRequirementsForSupplier, getRequestedSubmissions, getDeliveredProductsForAdmin,
     getCompletedRequirementsForSupplier
} = require('../controllers/requirements');
const ProductSubmission = require('../database/models/productsubmission'); // Import the ProductSubmission model
// Post a new requirement
router.post('/post-requirement', middleware.verifyToken, roleMiddleware('isBuyer'), postRequirement);

// Select a product for delivery
router.post('/select-product', middleware.verifyToken, roleMiddleware('isBuyer'), selectProductForDelivery);

router.post('/request-delivery', middleware.verifyToken, roleMiddleware('isBuyer'), RequestDelivery)
// Mark requirement as completed
router.post('/complete-requirement', middleware.verifyToken, roleMiddleware('isBuyer'), markRequirementAsCompleted);

// Get requirements for buyer
router.get('/requirements', middleware.verifyToken, roleMiddleware('isBuyer'), async (req, res) => {
    try {
        const start = parseInt(req.query.start) || 0;
        const limit = parseInt(req.query.limit) || 20;
        const requirements = await Requirement.find({ buyer: req.userId }).sort({date:-1}).populate('suppliers').skip(start).limit(limit);

        const totalRequirements = await Requirement.countDocuments({ buyer: req.userId });

        res.status(200).json({
            totalRequirements,
            requirements
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching requirements.', error });
    }
});
// Get requirement by customIdentifier
// router.get('/requirement/:customIdentifier', middleware.verifyToken,roleMiddleware('isBuyer'), async (req, res) => {
//     try {
//         const customIdentifier = req.params.customIdentifier;

//         // Find the requirement by customIdentifier and ensure the logged-in user is the buyer
//         const requirement = await Requirement.findOne({ customIdentifier, buyer: req.userId }).populate('buyer suppliers productDetails.supplier'). populate('productDetails.submissionId');

//         if (!requirement) {
//             return res.status(404).json({ message: 'Requirement not found or you are not authorized to view this requirement.' });
//         }

//         res.status(200).json(requirement);
//     } catch (error) {
//         res.status(500).json({ message: 'Error fetching requirement.', error });
//     }
// });

router.get('/requirement/:customIdentifier', middleware.verifyToken, async (req, res) => {
    try {
        const customIdentifier = req.params.customIdentifier;
        const userId = req.user._id;  // User ID from JWT token
        var isAdmin = req.user.isAdmin;  // Admin status from user object

        // Build query to find the requirement based on customIdentifier
        const query = { customIdentifier };

        // Use $or logic to check if the user is either the buyer or an admin
        query.$or = [
            { buyer: userId },        // Check if the logged-in user is the buyer
            { isAdmin: true }         // Check if the logged-in user is an admin
        ];

        // Find the requirement based on customIdentifier and either the buyer or admin check
        const requirement = await Requirement.findOne({
            customIdentifier,
            $or: [
                { buyer: req.userId },       // Check if the logged-in user is the buyer
                { isAdmin: req.isAdmin }        // Check if the logged-in user is an admin
            ]
        })
            .populate('buyer suppliers productDetails.supplier')
            .populate('productDetails.submissionId');

        if (!requirement) {
            return res.status(404).json({ message: 'Requirement not found or you are not authorized to view this requirement.' });
        }

        res.status(200).json(requirement);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching requirement.', error });
    }
});


// Post product information
router.post('/post-product-info', middleware.verifyToken, roleMiddleware('isSupplier'), postProductInfo);

// Get requirements forwarded to supplier
router.get('/requirements/for-sup', middleware.verifyToken, roleMiddleware('isSupplier'), getForwardedRequirementsForSupplier);
router.get('/supplier-completed-requirements', middleware.verifyToken, roleMiddleware('isSupplier'), getCompletedRequirementsForSupplier);
router.get('/supplier-completed-products', middleware.verifyToken, roleMiddleware('isSupplier'), getDeliveredProductsForSupplier);
// router.get('/supplier-delivered-products', middleware.verifyToken, roleMiddleware('isSupplier'), getCompletedProductsForSupplier);

// Admin routes
router.get('/admin-completed-products', middleware.verifyToken, roleMiddleware('isAdmin'), getDeliveredProductsForAdmin);

router.post('/forward-requirement', middleware.verifyToken, roleMiddleware('isAdmin'), forwardRequirementToSuppliers);
router.post('/complete-requirement', middleware.verifyToken, roleMiddleware('isAdmin'), markRequirementAsCompleted);
router.post('/post-requirement', middleware.verifyToken, roleMiddleware('isBuyer'), postRequirement);
router.post('/select-product', middleware.verifyToken, roleMiddleware('isBuyer'), selectProductForDelivery);

router.post('/product-info', middleware.verifyToken, upload.single('image'), postProductInfo);

// Admin forwards product info to the buyer
router.post('/forward-product-info', middleware.verifyToken, roleMiddleware('isAdmin'), forwardProductInfoToBuyer);

router.get('/all-product-submissions',middleware.verifyToken,roleMiddleware('isAdmin'), async (req, res) => {
    try {
        // Verify the user is an admin
        const admin = await User.findById(req.userId);
        if (!admin || !admin.isAdmin) {
            return res.status(403).json({ message: 'Unauthorized. You must be an admin to view product submissions.' });
        }

        // Get all product submissions
        const productSubmissions = await ProductSubmission.find().populate('requirement supplier').sort({date:-1});

        res.status(200).json({ productSubmissions });
    } catch (error) {
        console.error('Error fetching product submissions:', error); // Log the error
        res.status(500).json({ message: 'Error fetching product submissions.', error });
    }
});
router.post('/forward-product-submission', middleware.verifyToken, roleMiddleware('isAdmin'), async (req, res) => {
    try {
        const { requirementId, submissionId } = req.body;

        // Verify the user is an admin
        const admin = await User.findById(req.userId);
        if (!admin || !admin.isAdmin) {
            return res.status(403).json({ message: 'Unauthorized. You must be an admin to forward product information.' });
        }

        // Find the product submission by ID
        const productSubmission = await ProductSubmission.findById(submissionId);

        if (!productSubmission) {
            return res.status(404).json({ message: 'Product submission not found.' });
        }

        // Find the requirement by ID
        const requirement = await Requirement.findById(requirementId);

        if (!requirement) {
            return res.status(404).json({ message: 'Requirement not found.' });
        }

        // Forward the product submission to the requirement
        requirement.productDetails.push({
            name: productSubmission.name,
            price: productSubmission.price,
            image: productSubmission.image,
            supplier: productSubmission.supplier._id,
            submissionId: productSubmission._id  // Add submissionId to the productDetails
        });

        await requirement.save();

        // Update the status of the product submission
        productSubmission.status = 'Forwarded';
        await productSubmission.save();

        // Notify the buyer
        await Notification.create({
            userId: requirement.buyer,
            message: `Product information for your requirement ${requirement.customIdentifier} has been forwarded by an admin.`
        });

        res.status(200).json({ message: 'Product information forwarded to the requirement successfully.' });
    } catch (error) {
        console.error('Error forwarding product submissions:', error); // Log the error

        res.status(500).json({ message: 'Error forwarding product information.', error });
    }
});


// Admin forwards the requirement to suppliers
router.post('/forward-requirement', middleware.verifyToken, roleMiddleware('isAdmin'), forwardRequirementToSuppliers);

router.get('/forwarded-requirements', middleware.verifyToken, roleMiddleware('isSupplier'), getForwardedRequirementsForSupplier);

// router.get('/forwarded-requirement/:customIdentifier', middleware.verifyToken, async (req, res) => {
//     try {
//         const supplierId = req.userId;
//         const customIdentifier = req.params.customIdentifier;

//         // Find the requirement by customIdentifier and check if it's forwarded to this supplier
//         const requirement = await Requirement.findOne({ customIdentifier, forwardedTo: supplierId });

//         if (!requirement) {
//             return res.status(404).json({ message: 'Requirement not found or not forwarded to this supplier.' });
//         }

//         // Check if the supplier has already posted product information
//         const hasPosted = requirement.productDetails.some(detail => detail.supplier.toString() === supplierId.toString());

//         res.status(200).json({
//             ...requirement.toObject(), // Convert mongoose document to plain object
//             hasPosted // Add the flag to the response
//         });
//     } catch (error) {
//         res.status(500).json({ message: 'Error fetching requirement by customIdentifier.', error });
//     }
// });


// Get requirements for admin

router.get('/forwarded-requirement/:customIdentifier', middleware.verifyToken, async (req, res) => {
    try {
        const supplierId = req.userId;
        const customIdentifier = req.params.customIdentifier;

        // Find the requirement by customIdentifier and check if it's forwarded to this supplier
        const requirement = await Requirement.findOne({ customIdentifier, forwardedTo: supplierId });

        if (!requirement) {
            return res.status(404).json({ message: 'Requirement not found or not forwarded to this supplier.' });
        }

        // Check if the supplier has already posted product information for this requirement
        const productSubmission = await ProductSubmission.findOne({
            requirement: requirement._id,
            supplier: supplierId
        });

        res.status(200).json({
            ...requirement.toObject(),        // Convert mongoose document to plain object
            hasPosted: !!productSubmission,   // Convert the found submission to a boolean
            productSubmission: productSubmission ? productSubmission.toObject() : null // Include submission data if exists
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching requirement by customIdentifier.', error });
    }
});
router.get('/requested-submissions', middleware.verifyToken, roleMiddleware('isAdmin'), getRequestedSubmissions);

router.post('/confirm-delivery', middleware.verifyToken, roleMiddleware('isAdmin'), confirmDelivery)

router.post('/delivery-update', middleware.verifyToken, roleMiddleware('isAdmin'), updateStatusToDelivered);

router.get('/all-requirements', middleware.verifyToken, roleMiddleware('isAdmin'), async (req, res) => {
    try {
        const requirements = await Requirement.find().populate('buyer').sort({date:-1});
        res.status(200).json(requirements);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching requirements.', error });
    }
});
module.exports = router;
