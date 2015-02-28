module.exports = function (router, passport) {
  // API
  // http://localhost:8080/api/user
  // @POST
  router.post('/session', function (req, res, next) {
    passport.authenticate('login', function (err, user, info) {
      var error = err || info;
      console.log(error);
      if (error) {
        return res.json(400, error);
      }
      req.logIn(user, function (err) {
        if (err) {
          return res.send(err);
        }
        res.json(req.user.user_info);
      });
    })(req, res, next);
  });
  return router;
};
