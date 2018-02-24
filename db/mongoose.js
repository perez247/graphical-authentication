const mongoose = require('mongoose');

mongoose.Promise = Promise;
mongoose.connect(process.env.MONGODB_URI).catch(()=>{
    console.log("Could not connect to the database");
});

module.exports = {
    mongoose
}