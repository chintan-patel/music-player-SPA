'use strict';


var UserService = require(__dirname + '/user.factory.js');
module.exports = function (router) {
    router.get('/user', UserService.getUsers);
    router.post('/user', UserService.postUser);
    router.get('/user/:user_id', UserService.getUser);
    router.put('/user/:user_id', UserService.updateUser);
    router.delete('/user/:user_id', UserService.deleteUser);
};
