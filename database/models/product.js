const mongoose = require('mongoose');
const productSchema = mongoose.Schema({
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    prodName: {
        type: String,
        required: true
    },
    prodDesc: {
        type: String,
        required: true
    },
    customIdentifer: String,
    images: [{type: String}],
    prodPrice: {
        type: Number,
        required: true
    },
    countInStock: {
        type: Number,
        required: true,
        default: 0
    },
    prodSize: {
        type: String,
        required: true
    }, 
    isFeatured: {
        type: Boolean,
        default: false
    },
    date: {
        type: Date,
        default: Date.now
    },
    
    // NEW FIELDS - Multi-location support
    locations: [{
        state: { type: String, required: true },
        city: { type: String, required: true },
        stateCode: { type: String }, // For easier filtering (e.g., "MH", "DL")
        cityCode: { type: String }   // For easier filtering (e.g., "mumbai", "delhi")
    }],
    
    // NEW FIELDS - Enhanced product details
    brand: { 
        type: String,
        default: '' 
    },
    condition: {
        type: String,
        enum: ['new', 'like-new', 'good', 'fair', 'refurbished'],
        default: 'new'
    },
    minOrderQuantity: { 
        type: Number, 
        default: 1 
    },
    maxOrderQuantity: { 
        type: Number 
    },
    
    // NEW FIELDS - Business details
    businessType: {
        type: String,
        enum: ['manufacturer', 'wholesaler', 'distributor', 'retailer', 'supplier'],
        default: 'supplier'
    },
    
    // NEW FIELDS - Delivery & logistics
    deliveryAvailable: { 
        type: Boolean, 
        default: true 
    },
    estimatedDeliveryDays: { 
        type: Number,
        default: 7
    },
    freeDeliveryAbove: { 
        type: Number 
    }, // Free delivery above this amount
    
    // NEW FIELDS - Ratings & reviews (for future use)
    averageRating: { 
        type: Number, 
        default: 0, 
        min: 0, 
        max: 5 
    },
    totalReviews: { 
        type: Number, 
        default: 0 
    },
    
    // NEW FIELDS - Metadata
    tags: [{ type: String }], // For better search (e.g., "eco-friendly", "premium", "bulk")
    isActive: { 
        type: Boolean, 
        default: true 
    }, // Can be used to soft-delete
    views: { 
        type: Number, 
        default: 0 
    }, // Track product views
    lastUpdated: { 
        type: Date, 
        default: Date.now 
    }
});

productSchema.virtual('id').get(function(){
    return this._id.toHexString();
});

productSchema.set('toJSON',{
    virtuals: true,
});

// Enhanced indexes for better query performance
// Note: Text index already exists as 'product_text_search_index', so we skip creating a new one
// productSchema.index({ prodName: 'text', prodDesc: 'text', tags: 'text' });
productSchema.index({ category: 1, 'locations.cityCode': 1 });
productSchema.index({ prodPrice: 1 });
productSchema.index({ 'locations.stateCode': 1 });
productSchema.index({ 'locations.cityCode': 1 });
productSchema.index({ condition: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ isActive: 1, countInStock: 1 });
productSchema.index({ date: -1 });
productSchema.index({ averageRating: -1 });
productSchema.index({ businessType: 1 });

module.exports = mongoose.model('Product', productSchema);