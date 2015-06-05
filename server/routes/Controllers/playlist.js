'use strict';

/**
 * import playlist model
 */
var Playlist = require(__dirname + '/../models/playlist.js');


module.exports = function (router) {

  /**
   * API Endpoint: /api/playlist
   * @GET - gets all the not deleted playlist
   */
  router.get('/playlist', function (req, res) {
    Playlist.find({delete: false}, function (err, playlists) {
      var Map = [];
      playlists.forEach(function (playlist) {
        Map.push(playlist);
      });
      res.send(Map);
    });
  });

  /**
   * API Endpoint: http://localhost:8080/api/playlist
   * @POST
   */
  router.route('/playlist')
    .post(function (req, res) {

      var playlist = new Playlist();
      playlist.name = req.body.name;
      playlist.audio_ids = req.body.audio_ids;
      if (playlist.name == undefined) {
        res.json({message: 'Not Added'});
      }
      // save the playlist and check for errors
      playlist.save(function (err, data) {
        if (err) {
          res.send(err);
        }
        res.send(data);
      });
    });

  /**
   * API Endpoint: http://localhost:8080/api/playlist/:playlist_id
   * @GET - get single playlist item
   * @PUT - update single playlist item
   * @DELETE - deletes single playlist item
   */
  router.route('/playlist/:playlist_id')
    .get(function (req, res) {
      var query = Playlist.findById(req.params.playlist_id).where('delete', false);
      query.exec(function (err, playlist) {
        res.send(playlist);
      });
    })
    .delete(function (req, res) {
      Playlist.findById(req.params.playlist_id, function (err, playlist) {
        playlist.delete = true;
        playlist.save(function (err, data) {
          if (err) {
            res.send(err)
          }
          res.send(data);
        })
      });
    })
    .put(function (req, res) {
      Playlist.findById(req.params.playlist_id, function (err, playlist) {
        playlist.name = req.body.name;
        playlist.delete = req.body.delete;
        playlist.audio_ids = req.body.audio_ids;

        playlist.save(function (err, data) {
          if (err) {
            res.send(err);
          }
          res.send(data);
        });
      });
    });
};
