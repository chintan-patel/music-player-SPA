var Audio = require(__dirname + '/../models/audio.js');

module.exports = function (router) {
  router.get('/audio', function (req, res) {
    Audio.find({"delete": false}, function (err, audios) {
      var Map = {};
      audios.forEach(function (audio) {
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
    .post(function (req, res) {

      var audio = new Audio();
      audio.name = req.body.name;
      audio.key = req.body.key;
      audio.user_id = req.body.user_id;
      if (audio.name == undefined) {
        res.json({message: 'Not Added'});
      }
      // save the audio and check for errors
      audio.save(function (err, data) {
        if (err) {
          res.send(err);
        }
        res.send(data);
      });
    });

  router.route('/audio/:audio_id')
    .get(function (req, res) {
      Audio.findById(req.params.audio_id, function (err, audio) {
        res.send(audio);
      });
    })
    .put(function (req, res) {
      Audio.findById(req.params.audio_id, function (err, audio) {
        audio.name = req.body.name;

        audio.save(function (err) {
          if (err) {
            res.send(err);
          }
          res.json({message: 'Audio Updated!'});
        });
      });
    })
    .delete(function (req, res) {
      Audio.findById(req.params.audio_id, function (err, audio) {
        audio.delete = true;

        audio.save(function (err, audio) {
          if (err) {
            res.send(err);
          }
          res.json(audio);
        });
      });
    })
  ;
};
