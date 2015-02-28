var Audio = require(__dirname + '/../models/audio.js');
var fs = require('fs');
require('connect-busboy');


module.exports = function (router, s3client) {


// API
// http://localhost:8080/api/audio
// @POST
  router.route('/upload')
    .post(function (req, res) {
      var fstream;
      req.pipe(req.busboy);
      req.busboy.on('file', function (fieldname, file, filename) {
        console.log("Uploading: " + filename);
        fstream = fs.createWriteStream(__dirname + '/../../upload_files/' + filename);
        file.pipe(fstream);
        fstream.on('close', function () {
          var audio = new Audio();
          audio.name = filename;
          audio.user_id = req.body.user_id;
          audio.key = __dirname + '/../../upload_files/' + filename;
          if (audio.name == undefined) {
            res.json({message: 'Not Added'});
          }
          // save the audio and check for errors
          audio.save(function (err, data) {
            var audio_data = data;
            if (err) {
              res.send(err);
            }
            fs.readFile(audio.key, function (err, data) {
              if (err) {
                throw err;
              }
              var base64data = new Buffer(data, 'binary');
              var params = {
                Body: base64data,
                Bucket: "dev.kashcandi.com",
                Key: "user/1/content/" + audio_data._id + '/' + Math.random(1, 10) + '_' + filename,
                ACL: 'public-read'
              };
              s3client.putObject(params, function (err, response) {
                if (err) {
                  console.error("unable to upload:", err.stack);
                  res.send(err);
                }
                console.log('Uploaded...' + response);
                audio.key = 'https://s3.amazonaws.com/dev.kashcandi.com/' + params.Key;
                audio.save(function (err, audio_data) {
                  console.log(audio_data);
                  res.send(audio_data);
                })
              });
            });
          });
        });
      });
    });
};
