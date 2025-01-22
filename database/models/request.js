const mongoose = require('mongoose');

const requestSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    role: {
        type: String,
        enum: ['SUPPLIER', 'BUYER'], // Define types of requests
    },
    note: {
        type: String,
        required: true // Ensure that a note is provided with the request
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING'
    },
    date: {
        type: Date,
        default: Date.now
    }
});

requestSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

requestSchema.set('toJSON', {
    virtuals: true
});

module.exports = mongoose.model('Request', requestSchema);
