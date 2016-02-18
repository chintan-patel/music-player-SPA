'use strict';

/**
 * Models
 */
var User = require(__dirname + '/../models/user.js');

module.exports = function (router, passport) {
  router.get('/user', function (req, res) {
    if (!req.isAuthenticated()) {
      res.status(403);
    }
    User.find({delete: false}, function (err, users) {
		if(err) {
			console.log(err);
		}
      var Map = {};
      users && users.forEach(function (user) {
        Map[user._id] = user;
      });


      res.send(Map);
    });
  });

  /**
   * API Endpoint: http://localhost:8080/api/user
   * @POST
   */
  router.post('/user', function (req, res, next) {
    passport.authenticate('local-signup', function (err, user, info) {
      if (err) {
        res.status(400).send(err);
      }
      res.send(user);
    })(req, res, next);
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
          res.status(200).send(user);
        });
      res.status(200);
    })

  /**
   * PUT Update :user_id
   */
    .put(function (req, res) {

      // Find user_id
      User.findById(req.params.user_id, function (err, user) {
		  if(err) {
		  	res.status(500);
		  }
		  if(user) {
			if (req.body.username) {
			  user.username = req.body.username;
			}
			if (req.body.password) {
			  user.password = req.body.password;
			}
			if (req.body.salt) {
			  user.salt = req.body.salt;
			}
			if (req.body.first_name) {
			  user.first_name = req.body.first_name;
			}
			if (req.body.last_name) {
			  user.last_name = req.body.last_name;
			}
			if (req.body.delete) {
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
				  res.status(500).send();
				}
				res.json({message: true});
			  });
		  }
		  else {
            res.status(200).send({});
		  }
      });
    })

  /**
   * DELETE :user_id
   */
    .delete(function (req, res) {
      User.findById(req.params.user_id, function (err, user) {
        user.delete = true;

        // Soft delete
        user.update(function (err) {
          if (err) {
            res.send(err);
          }
          res.status(500).send();
        });
      });
    })
  ;
}
;
