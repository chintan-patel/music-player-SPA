'use strict';

var passport = require('passport');
module.exports = function (router) {
    router.get('/login', getLogin);
    router.post('/login', postLogin);
    router.post('/logout', postLogout);
};

function getLogin(req, res, next) {
    res.send(req.session);
};

function postLogin(req, res, next) {
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
};

function postLogout(req, res) {
    req.logout();

    // clean up when a user leaves, and broadcast it to other users
    socket.on('user:disconnected', function () {
        socket.broadcast.emit('user:left', {
            'username': socket.id
        });
    });
    res.send({ message: 'logout' });
};
