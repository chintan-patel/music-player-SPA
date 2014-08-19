var Audio = require('../models/audio.js');

module.exports = function(router) {
    router.get('/audio', function(req, res) {
	Audio.find( {} ,function(err, audios) {
		var Map= {};
		audios.forEach(function(audio) {
		    Map[audio._id] = audio;
		});
		res.send(Map);  
	    });
    });
    
    // API
    // http://localhost:8080/api/audio
    // @POST
    // @GET
    router.route('/audio')
	.post(function(req, res) {
		
	    var audio = new Audio();
	    audio.name = req.body.name;
	    console.log(req.body);
	    if (audio.name == undefined) {
		res.json({message: 'Not Added'});
	    }
	    // save the audio and check for errors
	    audio.save(function(err) {
		if (err) 
		{
		    res.send(err);
		}
		res.json({ message: 'Audio created!' });
	    });
	});
	
    router.route('/audio/:audio_id')
	.get(function(req,res){
	    Audio.findById( req.params.audio_id, function(err, audio) {
		res.send(audio);  
	    });
	})
	.put(function(req,res){
	    Audio.findById( req.params.audio_id, function(err, audio) {
		audio.name = req.body.name;
		
		audio.save(function(err){
		    if (err) {
			res.send(err);
		    }
		    res.json({ message: 'Audio Updated!' });
		});
	    });
	});
};