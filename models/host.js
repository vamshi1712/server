var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongooseUniqueValidator = require('mongoose-unique-validator');

var schema = new Schema({
    fullname: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    phone: {type: String, required: true},
    location: {type: String, required: true},
    pincode: {type: String, required: true},
    isUser: {type: Boolean, required: true},
    isHost: {type: Boolean, required: true}
    
});

schema.plugin(mongooseUniqueValidator);

module.exports = mongoose.model('Host', schema);