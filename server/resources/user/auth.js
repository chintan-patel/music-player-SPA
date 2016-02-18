'use strict';

/**
 * Models
 */
var User = require(__dirname + '/user');

module.exports = function (app, jwt) {
    app.post('/authenticate', authenticate);
};

function authenticate(req, res, next) {
    User.findOne({ 'local.username': req.body.username }, function (err, user) {
        if (err) {
            res.send(401, err);
            return;
        }

        if (!req.body.password) {
            res.send(401, 'Password is a required field');
            return;
        }

        // If user password does not match
        if (user.validPassword(req.body.password)) {
            res.send(401, 'Wrong user or password');
            return;
        }
        var profile = {
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.local.username,
            id: user._id
        };
        console.log(profile);

        // We are sending the profile inside the token
        var token = jwt.sign(profile, 'secret', { expiresInMinutes: 60 * 5 });

        res.json({ token: token });

    });
}