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
     prodName:String,
     prodDesc: String,
     customIdentifer:String,
     images:[{type:String}],
     prodPrice:Number,
     countInStock:Number,
     prodSize:{
        type:String,
        required:true
     }, 
     isFeatured:{
        type:Boolean,
        default:false
     },
     date: {
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
productSchema.index({ prodName: 'text', prodDesc: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ prodPrice: 1 });
module.exports = mongoose.model('Product', productSchema);