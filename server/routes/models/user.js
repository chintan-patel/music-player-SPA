/**
 * mongoose schema for accessing User Collection
 * bcrypt for encrypting the password
 * Adding salt factor
 * @type {*|exports}
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');


var UserSchema   = new Schema({
  local: {
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true}
  },
  facebook: {
    id: String,
    token: String,
    email: String,
    name: String
  },
  google: {
    id: String,
    token: String,
    email: String,
    name: String
  },
  twitter: {
    id: String,
    token: String,
    displayName: String,
    username: String
  },
	salt: String,
  delete: {type: Boolean, default: false},
	first_name: String,
	last_name: String,
	created_on:  {type: Date, default: Date.now}
});

UserSchema.methods.generateHash = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};


// Password verification used while login
UserSchema.methods.validPassword = function (candidatePassword) {
  bcrypt.compareSync(candidatePassword, this.local.password);
};

// Expose UserSchema as 'User' model
module.exports = mongoose.model('User', UserSchema);
