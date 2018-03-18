var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    title: {type: String, required: true},
    phone: {type: String, required: true},
    location: {type: String, required: true},
    address: {type: String, required: true},
    description: {type: String, required: true},
    pincode: {type: String, required: true},
    isHost: {type: Boolean, required: true},
    email: {type: String, required: true, unique: true},
});


module.exports = mongoose.model('Event', schema);