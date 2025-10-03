const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    serviceName: {
        type: String,
        required: true,
        trim: true
    },
    serviceDesc: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    images: [{
        type: String
    }],
    price: {
        type: Number,
        default: 0
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServiceCategory',
        required: false
    },
    availableRegions: [{
        type: String,
        trim: true
    }],
    contactInfo: {
        phone: {
            type: String,
            default: ''
        },
        email: {
            type: String,
            default: ''
        },
        address: {
            type: String,
            default: ''
        }
    },
    ratings: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        review: {
            type: String
        },
        date: {
            type: Date,
            default: Date.now
        }
    }],
    averageRating: {
        type: Number,
        default: 0
    },
    customIdentifier: {
        type: String,
        required: true,
        unique: true
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Virtual for formatted price
serviceSchema.virtual('formattedPrice').get(function () {
    // Only execute if price is properly loaded and is a valid number
    if (this.price !== undefined && this.price !== null && !isNaN(this.price) && typeof this.price === 'number') {
        return this.price.toFixed(2);
    }
    return '0.00';
});

// Middleware to calculate average rating before saving
serviceSchema.pre('save', function (next) {
    if (this.ratings && this.ratings.length > 0) {
        const totalRating = this.ratings.reduce((sum, item) => sum + item.rating, 0);
        this.averageRating = totalRating / this.ratings.length;
    } else {
        this.averageRating = 0;
    }
    next();
});

// Ensure virtuals are included in JSON output
serviceSchema.set('toJSON', { virtuals: true });
serviceSchema.set('toObject', { virtuals: true });

const Service = mongoose.model('Service', serviceSchema);

exports.Service = Service;
