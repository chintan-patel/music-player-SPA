var Playlist = require(__dirname + '/../models/playlist.js');


module.exports = function(router) {
    router.get('/playlist', function(req, res) {
	Playlist.find( { delete: false} ,function(err, playlists) {
		var Map= [];
		playlists.forEach(function(playlist) {
		    Map.push( playlist );
		});
		res.send(Map);  
	    });
    });
    
    // API
    // http://localhost:8080/api/playlist
    // @POST
    // @GET
    router.route('/playlist')
	.post(function(req, res) {
		
	    var playlist = new Playlist();
	    playlist.name = req.body.name;
	    playlist.audio_ids = req.body.audio_ids;
	    console.log(req.body);
	    if (playlist.name == undefined) {
		res.json({message: 'Not Added'});
	    }
	    // save the playlist and check for errors
	    playlist.save(function(err, data) {
		if (err) 
		{
		    res.send(err);
		}
		res.send(data);
	    });
	});
	
    router.route('/playlist/:playlist_id')
	.get(function(req,res){
	    Playlist.findById( req.params.playlist_id, function(err, playlist) {
		res.send(playlist);  
	    });
	})
	.put(function(req,res){
	    Playlist.findById( req.params.playlist_id, function(err, playlist) {
		playlist.name = req.body.name;
		playlist.delete = req.body.delete;
		playlist.audio_ids = req.body.audio_ids;

		playlist.save(function(err, data){
		    if (err) {
			res.send(err);
		    }
		    res.send( data );
		});
	    });
	});
};