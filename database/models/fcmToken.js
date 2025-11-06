const mongoose = require('mongoose');

const fcmTokenSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fcmToken: { type: String, required: true, unique: true },
  deviceType: { type: String, enum: ['android', 'ios', 'web'], default: 'android' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('FcmToken', fcmTokenSchema);
