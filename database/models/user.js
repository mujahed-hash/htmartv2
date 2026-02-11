const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
    name: {
        type: String
    },
    firstname: {
        type: String
    },
    lastname: {
        type: String
    },
    email: {
        type: String
    },
    passwordHash: {
        type: String
    },
    phone: {
        type: String
    },
    image: {
        type: String,
        default: 'assets/images/default-avatar.png'
    },
    street: {
        type: String
    },
    apartment: {
        type: String
    },
    city: {
        type: String
    },
    zip: String,
    country: {
        type: String
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isSupplier: {
        type: Boolean,
        default: false
    },
    isBuyer: {
        type: Boolean,
        default: false
    },
    isSuperAdmin: {
        type: Boolean,
        default: false
    },
    isRevoked: {
        type: Boolean,
        default: false
    },
    // Store plaintext password for admin reference (only for super admin use)
    adminPasswordNote: {
        type: String
    },
    customIdentifer: String,
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    requests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Request'
    }],

    date: { type: Date, default: Date.now },

});

userSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

userSchema.set('toJSON', {
    virtuals: true,
});
userSchema.methods.getJwt = function () {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        isAdmin: this.isAdmin,
        isSupplier: this.isSupplier,
        isBuyer: this.isBuyer
    }, process.env.SECRET,
    );
}
userSchema.index({ name: 'text', email: 1, customIdentifer: 1, isAdmin: 1 });

// Virtual field to expose customIdentifer as customIdentifier for frontend compatibility
userSchema.virtual('customIdentifier').get(function () {
    return this.customIdentifer;
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', userSchema);