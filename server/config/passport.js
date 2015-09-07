/**
 * User Model
 * LocalStrategy used by passportjs
 */
var User = require(__dirname + '/../routes/models/user.js');
var LocalStrategy = require('passport-local').Strategy;

module.exports = function (passport) {

  // Passport session setup.
  //   To support persistent login sessions, Passport needs to be able to
  //   serialize users into and deserialize users out of the session.  Typically,
  //   this will be as simple as storing the user ID when serializing, and finding
  //   the user by ID when de-serializing.
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });

  // Use the LocalStrategy signup with passport.
  passport.use('local-signup', new LocalStrategy({
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true
    },
    function (req, username, password, done) {

      // Async call
      process.nextTick(function () {
        User.findOne({'local.username': username}, function (err, user) {
          if (err) {
            console.log(err);
            return done(err);
          }
          console.log(user);

          if (user) {
            return done(null, false, {message: 'User email already taken: ' + username});
          } else {
            var newUser = new User();

            newUser.local.username = username;
            newUser.local.password = newUser.generateHash(password);
            newUser.salt = req.body.salt;
            newUser.first_name = req.body.first_name;
            newUser.last_name = req.body.last_name;
            newUser.delete = false;

            // save the user
            newUser.save(function (err) {
              if (err)
                throw err;
              return done(null, newUser);
            });
          }
        });
      })
    }));

  // Use the LocalStrategy login within Passport.
  passport.use('local-login', new LocalStrategy({
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true
    },
    function (req, username, password, done) {

      User.findOne({'local.username': username}, function (err, user) {
        if (err) {
          return done(err);
        }

        // If no user found
        if (!user) {
          return done(null, false, {message: 'No User found'});
        }

        // If user password does not match
        if (user.validPassword(password)) {
          return done(null, false, {message: 'Password does not match'});
        }

        // If all is ok, return user
        return done(null, user);
      });
    }));
};
