var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var AudioSchema   = new Schema({
	name: String,
	user_id: String,
	key: String,
	image: String,
	created_on:  {type: Date, default: Date.now}

});

module.exports = mongoose.model('Audio', AudioSchema);
