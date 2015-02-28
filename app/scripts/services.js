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
  .factory('MainFactory', ['$q', '$http', function ($q, $http) {

    return {
      loadAudioData: function () {
        var defer = $q.defer();
        $http.get('/api/audio')
          .success(function (data) {
            defer.resolve(data);
          })
          .error(function () {
            defer.reject('Cannot Connect: Network Issues');
          });
        return defer.promise;
      },
      loadUserData: function () {
        var defer = $q.defer();
        $http.get('/api/user')
          .success(function (data) {
            defer.resolve(data);
          })
          .error(function () {
            defer.reject('Cannot Connect: Network Issues');
          });
        return defer.promise;
      },
      loadPlaylistData: function () {
        var defer = $q.defer();
        $http.get('/api/playlist')
          .success(function (data) {
            if (data.length <= 0) {
              $http.post('/api/playlist', {
                'name': '[Default Playlist]',
                'audioIds': []
              })
                .success(function (data) {
                  var tempArray = [];
                  tempArray.push(data);
                  defer.resolve(tempArray);
                })
                .error(function () {
                  defer.reject('Cannot Connect: Network Issues');
                });
            }
            else {
              defer.resolve(data);
            }
          })
          .error(function () {
            defer.reject('Cannot Connect: Network Issues');
          });
        return defer.promise;
      }
    };
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
        Session.get(function (user) {
          $rootScope.currentUser = user;
        });
      }
    };
  }]);
