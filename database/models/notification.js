const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: String,
    isRead: { type: Boolean, default: false },
    adminRead: { type: Boolean, default: false },
    orderIdentifier: String,
    productIdentifier: String,
    requirementIdentifier: String,
    date: { type: Date, default: Date.now },
    // expireAt: { type: Date, default: () => Date.now() + 60 * 1000 } // 1 minute from now

    expireAt: { type: Date, default: () => Date.now() + 60 * 24 * 60 * 60 * 1000 } // 60 days from creation
});

// Create TTL index
notificationSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Notification', notificationSchema);
