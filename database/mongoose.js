const mongoose = require('mongoose');
mongoose.promise = global.promise;
mongoose.connect('mongodb://127.0.0.1:27017/hmdb')
  .then(() => {
    console.log('connected successfully to mongo');
  })
  .catch((e) => {
    console.log('error while connecting to mongoDB');
    console.log(e);
  });


module.exports = {
    mongoose
}








