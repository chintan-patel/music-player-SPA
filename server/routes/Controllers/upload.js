var Audio = require(__dirname + '/../models/audio.js');
var fs = require('fs');
var busboy = require('connect-busboy');


module.exports = function(router, s3client) {
    
    
// API
// http://localhost:8080/api/audio
// @POST
router.route('/upload')
    .post(function(req, res) {
	var fstream;
	req.pipe(req.busboy);
	req.busboy.on('file', function (fieldname, file, filename) {
	    console.log("Uploading: " + filename); 
	    fstream = fs.createWriteStream(__dirname + '/../../upload_files/' + filename);
	    file.pipe(fstream);
	    fstream.on('close', function () {
		var audio = new Audio();
		
		audio.name = filename;
		audio.key= __dirname + '/../../upload_files/' + filename;
		audio.user_id = req.body.user_id;
		if (audio.name == undefined) {
		    res.json({message: 'Not Added'});
		}
		// save the audio and check for errors
		audio.save(function(err, data) {
		    if (err) 
		    {
			res.send(err);
		    }
		    var params = {
			Body: __dirname + '/../../upload_files/' + data.key,
			Bucket: "dev.kashcandi.com",
			Key: "/user_id/content/" + data._id + "/filename",
			ACL: 'public-read'
		    };
		    console.log(params);
		    s3client.putObject(params, function(err, data){
			if (err) {
			    console.error("unable to upload:", err.stack);
			    res.send(err);
			}
			console.log("done uploading");
			console.log(data);
			res.send(data);
		    });
		});
	    });
	});
    });
};