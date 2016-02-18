/**
 * Handle upload module
 * @POST
 **/
var Audio = require(__dirname + '/audio/audio');
var User = require(__dirname + '/user/user');
var fs = require('fs');
var AWS = require('aws-sdk');
var credentials = new AWS.SharedIniFileCredentials({profile: 'dhd-account'});
AWS.config.credentials = credentials;
var s3client = new AWS.S3();

// Required connect-busboy for reading request body with files
require('connect-busboy');


module.exports = function (router) {

  /**
   * API Endpoint: /api/audio/upload
   * Handle user upload
   * @POST
   **/
  router.route('/audio/upload')
    // POST Request/Response Handler
    .post(function (req, res) {

      var fileStream;
      req.pipe(req.busboy);
      req.busboy.on('file', function (fieldname, file, filename) {

        console.log("Uploading: " + filename);

        // Create InputWriteStream
        fileStream = fs.createWriteStream(__dirname + '/../../app/mp3/' + filename);

        // Pipe stream of file to stream
        file.pipe(fileStream);

        // 'close' event after reading fileStream
        fileStream.on('close', function () {

          // Instance of Audio()
          var audio = new Audio();

          // Assigned values from request to model
          audio.name = filename;
          audio.user_id = req.body.user_id;
          audio.key = __dirname + '/../../app/mp3/' + filename;

          // Error response if the filename is not available
          if (audio.name == undefined) {
            res.json({message: 'Not Added'});
          }

          // save the audio and check for errors
          audio.save(function (err, data) {
            if (err) {
              res.send(err);
            }
            // Creating S3 structure to save file on Amazon S3
            // Add random code to make sure the file is unique
            // replace with real user_id
            var filePath = "user/1/content/" + data._id + '/' + Math.round(Math.random(1, 1000000)) + '_' + filename;

            // Call standalone class to move file from local to S3
            // Synchronous call
            if (upload(audio.key, filePath)) {

              // Update model
              audio.save(function (err, audio_data) {
                console.log(audio_data);
                res.send(audio_data);
              })
            }
            else {
              // Send error message if s3 upload fails
              res.send('Upload Failed to S3');
            }

          });
        });
      });
    });

  /**
   * API Endpoint: /api/user/upload
   * Handle user upload
   * @POST
   **/
  router.route('/user/:user_id/upload')

    // POST Request/Response Handler
    .post(function (req, res) {

      var fileStream, user_id;
      if (req.busboy) {
        req.busboy.on('field', function (data, value) {
          user_id = value;
          console.log(value);
        });

        // Detect file
        req.busboy.on('file', function (fieldname, file, filename) {

          // Local Path
          var localPath = __dirname + '/../../upload_files/users/profile_images/' + filename;

          // Create fileStream to localPath
          fileStream = fs.createWriteStream(localPath);
          file.pipe(fileStream);

          // File close
          fileStream.on('close', function () {

            // save the user and check for errors
            User.findById(user_id, function (err, user) {
              if (err) {
                res.send(err);
              }
              user.profile_image = localPath;
              var filePath = "user/" + user._id + "/profile/" + Math.round(Math.random(1, 1000000)) + '_' + filename;

              // Upload the file to profile image
              if (upload(user.profile_image, filePath, res)) {

                // Update the user with new file location
                user.update({profile_image: user.profile_image}, function (err, user_data) {
                  console.log(user_data);
                  res.send(user_data);
                })
              }
              else {

                // Error on file upload
                res.send('Upload Failed to S3');
              }

            });
          });
        });
        req.pipe(req.busboy);
      }
    });
};

/**
 * @param localFile - local filesystem
 * @param filePath - S3 file path
 * @param s3client - S3 client
 * @param res - Response
 */
function upload(localFile, filePath, res) {

  // Read file
  fs.readFile(localFile, function (err, data) {
    if (err) {
      throw err;
    }
    var base64data = new Buffer(data, 'binary');

    // Params for Amazon S3 request
    var params = {
      Body: base64data,
      Bucket: "dev.musicapp.com",
      Key: filePath,
      ACL: 'public-read'
    };

    // S3 API
    s3client.putObject(params, function (err, response) {
      if (err) {
        console.error("unable to upload:", err.stack);
        res.send(err);
      }
      return true;
    });
  });
}
