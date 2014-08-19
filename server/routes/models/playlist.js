var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
	console.log('Connected');
});

var PlaylistSchema   = new Schema({
	name: String,
	audio_ids: Array
});

PlaylistSchema.methods.getAudioIds = function () {
	var Map= {};
	this.audio_ids.forEach(function(audio_id) {
	    Map.push(audio_id);
	});
	return Map;
}

module.exports = mongoose.model('Playlist', PlaylistSchema);
