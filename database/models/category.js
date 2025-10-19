const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
    itemType:String,
    itemName:String,
    image:[{type:String}],
    customIdentifer:String,
});

categorySchema.virtual('id').get(function(){
    return this._id.toHexString();
});

// Virtual field to expose customIdentifer as customIdentifier for frontend compatibility
categorySchema.virtual('customIdentifier').get(function() {
  return this.customIdentifer;
});

categorySchema.set('toJSON',{
    virtuals: true,
});
module.exports = mongoose.model('Category', categorySchema);