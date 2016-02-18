var User = require(__dirname + '/user');
var passport = require('passport');
module.exports = {
    getUsers: getUsers,
    getUser: getUser,
    postUser: postUser,
    updateUser: updateUser,
    deleteUser: deleteUser
}

function getUsers(req, res) {
    User.find({ delete: false }, function (err, users) {
        if (err) {
            console.log(err);
        }
        var Map = {};
        users && users.forEach(function (user) {
            Map[user._id] = user;
        });
        res.send(Map);
    });
};

function postUser(req, res, next) {
    passport.authenticate('local-signup', function (err, user, info) {
        if (err) {
            res.status(403).send(err);
        }
        res.send(user);
    })(req, res, next);
};

function getUser(req, res) {
    User.findById(req.params.user_id, function (err, user) {
        res.status(200).send(user);
    });
    res.status(200);
};

function updateUser(req, res) {

    // Find user_id
    User.findById(req.params.user_id, function (err, user) {
        if (err) {
            res.status(500);
        }
        if (user) {
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
                    res.json({ message: true });
                });
        }
        else {
            res.status(200).send({});
        }
    });
}

function deleteUser(req, res) {
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
};
