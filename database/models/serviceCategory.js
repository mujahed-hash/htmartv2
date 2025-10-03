const mongoose = require('mongoose');

const serviceCategorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    icon: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    customIdentifier: {
        type: String,
        required: true,
        unique: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    sortOrder: {
        type: Number,
        default: 0
    },
    parentCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServiceCategory',
        default: null
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Virtual for getting all services in this category
serviceCategorySchema.virtual('services', {
    ref: 'Service',
    localField: '_id',
    foreignField: 'category'
});

serviceCategorySchema.virtual('id').get(function() {
    return this._id.toHexString();
});

serviceCategorySchema.set('toJSON', {
    virtuals: true
});

const ServiceCategory = mongoose.model('ServiceCategory', serviceCategorySchema);

module.exports = ServiceCategory;
