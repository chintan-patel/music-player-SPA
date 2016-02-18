/**
 * mongoose schema for accessing Audio Collection
 * @type {*|exports}
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AudioSchema = new Schema({
    name: String,
    user_id: String,
    key: String,
    image: String,
    delete: { type: Boolean, default: false },
    created_on: { type: Date, default: Date.now }

});

module.exports = mongoose.model('Audio', AudioSchema);
