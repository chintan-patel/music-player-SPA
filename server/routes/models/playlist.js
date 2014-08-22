var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

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
