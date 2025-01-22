const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name:{
        type:String
    },
    email:{
        type:String
    },
    passwordHash:{
        type:String
    },
    phone:{
        type:String
    },
  
    street:{
        type:String
    },
    apartment:{
        type:String
    },
    city:{
        type:String
    },
    zip:String,
    country:{
        type:String
    },
    isAdmin:{
        type:Boolean,
        default:false
    },
    isSupplier:{
        type:Boolean,
        default:false
    },
    isBuyer:{
        type:Boolean,
        default:false
    },
    customIdentifer:String,
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

userSchema.virtual('id').get(function(){
    return this._id.toHexString();
});

userSchema.set('toJSON',{
    virtuals: true,
});
userSchema.methods.getJwt = function() {
    return jwt.sign({
        _id: this._id,
        email: this.email
    }, process.env.secret,
);
}
userSchema.index({ name: 'text', email: 1, customIdentifer: 1, isAdmin: 1 });

module.exports = mongoose.model('User', userSchema);