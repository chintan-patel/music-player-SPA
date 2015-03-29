/**
 * mongoose schema for accessing Client Collection
 * bcrypt for encrypting the password
 * Adding salt factor
 * @type {*|exports}
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var ClientSchema   = new Schema({
  name: { type: String, unique: true, required: true },
  id: { type: String, required: true },
  secret: { type: String, required: true },
  userId: { type: String, required: true },
	created_on:  {type: Date, default: Date.now}
});

// Expose ClientSchema as 'Client' model
module.exports = mongoose.model('Client', ClientSchema);
