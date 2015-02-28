'use strict';

var app = angular.module('musicPlayerApp.Factories', []);

app.factory('socket', function ($rootScope) {

  var socket = io.connect('http://localhost:3000');
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
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
  .factory('Session', ['$resource', function ($resource) {
    return $resource('/api/session');
  }])
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
  .factory('UserFactory', ['$resource', function ($resource) {
    return $resource('/api/user', null,
      {
        'get': {method: 'GET'},
        'save': {method: 'POST'},
        'query': {method: 'GET', isArray: false},
        'remove': {method: 'DELETE'},
        'delete': {method: 'DELETE'}
      });
  }])
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
  .factory('Auth', ['Session', '$cookieStore', '$rootScope', function (Session, $cookieStore, $rootScope) {
    $rootScope.currentUser = $cookieStore.get('user') || null;
    $cookieStore.remove('user');

    return {

      login: function (provider, user, callback) {
        Session.save({
          provider: provider,
          username: user.username,
          password: user.password,
          rememberMe: user.rememberMe
        }, function (user) {
          $rootScope.currentUser = user;
          return callback();
        }, function (err) {
          return callback(err.data);
        });
      },
      currentUser: function () {
        Session.get(function (parameters) {
          $rootScope.currentUser = parameters.user;
        });
      }
    };
  }]);
