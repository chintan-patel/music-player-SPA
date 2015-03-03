'use strict';

/**
 * Models
 */
var User = require(__dirname + '/../models/user.js');
var HttpStatus = require('http-status-codes');

module.exports = function (router) {
  router.get('/user', function (req, res) {
    User.find({delete: false}, function (err, users) {
      var Map = {};
      users.forEach(function (user) {
        Map[user._id] = user;
      });
      res.send(Map);
    });
  });

  /**
   * API Endpoint: http://localhost:8080/api/user
   * @POST
   */
  router.route('/user')
    .post(function (req, res) {

      // Assign values to user model
      var user = new User();
      user.username = req.body.username;
      user.password = req.body.password;
      user.salt = req.body.salt;
      user.first_name = req.body.first_name;
      user.last_name = req.body.last_name;
      user.delete = false;
      if (user.username == undefined) {
        res.json({message: 'Not Added'});
      }
      // save the user and check for errors
      user.save(function (err, result) {
        if (err) {
          res.send(err);
        }
        res.send(result);
      });
    });

  /**
   * API Endpoint: http://localhost:8080/api/user/:user_id
   * @POST
   * @GET
   */
  router.route('/user/:user_id')

    // GET :user_id
    .get(function (req, res) {
      User.findById(req.params.user_id, function (err, user) {
        res.send(user);
      });
    })

  /**
   * PUT Update :user_id
   */
    .put(function (req, res) {

      // Find user_id
      User.findById(req.params.user_id, function (err, user) {
        if (req.body.username != undefined) {
          user.username = req.body.username;
        }
        if (req.body.password != undefined) {
          user.password = req.body.password;
        }
        if (req.body.salt != undefined) {
          user.salt = req.body.salt;
        }
        if (req.body.first_name != undefined) {
          user.first_name = req.body.first_name;
        }
        if (req.body.last_name != undefined) {
          user.last_name = req.body.last_name;
        }
        if (req.body.delete != undefined) {
          user.delete = req.body.delete;
        }

        // Update user model with values
        user.update(
          {
            first_name: user.first_name,
            last_name: user.last_name,
            delete: user.delete,
            username: user.username
          },
          function (err) {
            if (err) {
              console.log(err);
              res.send(HttpStatus.INTERNAL_SERVER_ERROR);
            }
            res.json({message: true});
          });
      });
    })

  /**
   * DELETE :user_id
   */
    .delete(function (req, res) {
      User.findById(req.params.user_id, function (err, user) {
        user.delete = true;
        console.log(user);

        // Soft delete
        user.update(function (err) {
          if (err) {
            console.log(err);
            res.send(err);
          }
          res.send(HttpStatus.INTERNAL_SERVER_ERROR);
        });
      });
    })
  ;
};
