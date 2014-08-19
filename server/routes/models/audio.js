var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
	console.log('Connected');
});


var AudioSchema   = new Schema({
	name: String
});

AudioSchema.methods.getName = function () {
  var greeting = this.name
    ? "Meow name is " + this.name
    : "I don't have a name"
  return greeting;
}

module.exports = mongoose.model('Audio', AudioSchema);
