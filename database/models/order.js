const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required:true
  },

  orderItems: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    prodSize: {
      type: String,
    }
  }],
  customIdentifer:String,

  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  totalPrice: { type: Number, required: true },
  notes: { type: String },
  status: { 
    type: String, 
    enum: ["Pending", "Approved", "Delivered", "Cancelled"], // Add enum validation here
    default: 'Pending' 
  },
  date: {
    type: Date,
    default: Date.now
}
}, { timestamps: true });
orderSchema.index({ user: 1, customIdentifer: 1, status: 1 });

// Index for sorting or querying by date
orderSchema.index({ date: -1 });

module.exports = mongoose.model('Order', orderSchema);
