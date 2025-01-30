const mongoose = require('mongoose');

const requirementSchema = mongoose.Schema({
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    suppliers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    forwardedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],  // Track suppliers notified about this requirement
    reqDetails: String,
    customIdentifier: String,
    status: { 
        type: String, 
        enum: ['Pending', 'Forwarded', 'Requested', 'Completed', 'Delivered'], 
        default: 'Pending' 
    },
    productDetails: [{ 
        name: String,
        price: Number,
        image: String,
        supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        prodStatus:String,
        submissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductSubmission' }  // New field to reference the ProductSubmission
    }],
    selectedProduct: {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductSubmission' },
        supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    },
    date: { type: Date, default: Date.now }
});
requirementSchema.index({ buyer: 1, status: 1, customIdentifier: 1 });

module.exports = mongoose.model('Requirement', requirementSchema);
