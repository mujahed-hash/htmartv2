const mongoose = require('mongoose');

const productSubmissionSchema = new mongoose.Schema({
    requirement: { type: mongoose.Schema.Types.ObjectId, ref: 'Requirement', required: true },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['Pending', 'Forwarded', 'Requested', 'Completed', 'Delivered'], 
        default: 'Pending' 
    },
    date: { type: Date, default: Date.now }
});
productSubmissionSchema.index({ requirement: 1, supplier: 1, status: 1 });

module.exports = mongoose.model('ProductSubmission', productSubmissionSchema);
