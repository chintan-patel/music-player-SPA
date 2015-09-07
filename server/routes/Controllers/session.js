'use strict';


module.exports = function (router, passport) {

  router.get('/login', function(req, res, next){
    res.send(req.session);
  });


  /**
   * API Endpoint: http://localhost:8080/api/login
   * @POST
   */
  router.post('/login', function (req, res, next) {
    passport.authenticate('local-login', function (err, user, info) {
      var error = err || info;
      if (error) {
        return res.json(400, error);
      }
      req.logIn(user, function (err) {
        if (err) {
          return res.send(err);
        }

        // notify other clients that a new user has joined
        if (socket) {
          socket.broadcast.emit('user:join', {
            _id: user._id,
            full_name: user.first_name + " " + user.last_name,
            username: user.local.username
          });
        }
        user.local.password = null;
        res.status(200).send(user);
      });
    })(req, res, next);
  });

  /**
   * Logout
   */
  router.post('/logout', function (req, res) {
    req.logout();

    // clean up when a user leaves, and broadcast it to other users
    socket.on('user:disconnected', function () {
      socket.broadcast.emit('user:left', {
        'username': socket.id
      });
    });
    res.send({message: 'logout'});
  });


  return router;
};
