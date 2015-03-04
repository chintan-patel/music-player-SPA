'use strict';

/**
 * Factory / Service
 * @type {module}
 */
var app = angular.module('musicPlayerApp.Factories', []);

// Socket Service to connect with Node app
app.factory('socket', function ($rootScope) {
  var socket = io.connect('http://localhost:3000');
  return {

    // Event Listener
    on: function (eventName, callback) {
      socket.on(eventName, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },

    // Event Broadcast to Node app
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      });
    }
  };
})

  // Session Service handles the user login
  .factory('Session', ['$resource', function ($resource) {
    return $resource('/api/session');
  }])

  // AudioFactory handles the api endpoint for audio resource
  .factory('AudioFactory', ['$resource', function ($resource) {
    return $resource('/api/audio', null,
      {
        'get': {method: 'GET'},
        'save': {method: 'POST'},
        'query': {method: 'GET', isArray: false},
        'remove': {method: 'DELETE'},
        'delete': {method: 'DELETE'}
      });
  }])

  // UsersFactory handles the api endpoint for users resource
  .factory('UsersFactory', ['$resource', function ($resource) {
    return $resource('/api/user', null,
      {
        'get': {method: 'GET'},
        'save': {method: 'POST'},
        'query': {method: 'GET', isArray: false},
        'remove': {method: 'DELETE'},
        'delete': {method: 'DELETE'}
      });
  }])

  // UserFactory handles the api endpoint for user resource
  .factory('UserFactory', ['$resource', function ($resource) {
    return $resource('/api/user/:id', null,
      {
        'get': {method: 'GET'},
        'save': {method: 'POST'},
        'update': {method: 'PUT'},
        'query': {method: 'GET', isArray: false},
        'remove': {method: 'DELETE'},
        'delete': {method: 'DELETE'}
      });
  }])

  // PlaylistFactory handles the api endpoint for playlist resource
  .factory('PlaylistFactory', ['$resource', function ($resource) {
    return $resource('/api/playlist', null,
      {
        'get': {method: 'GET'},
        'save': {method: 'POST'},
        'query': {method: 'GET', isArray: true},
        'remove': {method: 'DELETE'},
        'delete': {method: 'DELETE'}
      });
  }])

  // Auth service to authenticate the user using cookie and session
  .factory('Auth', ['Session', '$cookieStore', '$rootScope', function (Session, $cookieStore, $rootScope) {
    $rootScope.currentUser = $cookieStore.get('user') || null;
    $cookieStore.remove('user');

    return {

      // Login using provider, used in LoginController
      login: function (provider, user, callback) {
        Session.save({
          provider: provider,
          username: user.username,
          password: user.password,
          rememberMe: user.rememberMe
        }, function (user) {
          $rootScope.currentUser = user;
          $cookieStore.put('user', user._id);
          return callback();
        }, function (err) {
          return callback(err.data);
        });
      },

      // sets current user in session
      currentUser: function () {
        Session.get(function (parameters) {
          console.log(parameters);
          $rootScope.currentUser = parameters.user;
        });
      }
    };
  }]);
