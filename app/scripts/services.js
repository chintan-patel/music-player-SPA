'use strict';

/**
 * Factory / Service
 * @type {module}
 */
// Socket Service to connect with Node app
var app = angular.module('musicPlayerApp.Factories', [])
  .factory('socket', ['$rootScope', '$window', function ($rootScope, $window) {
    var socket = io.connect('http://localhost:3000', {
      'query': 'token=' + $window.sessionStorage.token
    });

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
  .factory('Auth', ['$resource', function ($resource) {
    return $resource('/authenticate', null,
      {
        'save': {method: 'POST'}
      });
  }])
  .
  factory('authInterceptor', ['$rootScope', '$q', '$window', '$location', function ($rootScope, $q, $window, $location) {
    return {
      request: function (config) {
        config.headers = config.headers || {};
        if ($window.sessionStorage.token) {
          config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
        }
        return config;
      },
      response: function (response) {
        if (response.status === 401) {
          console.log('error', response);
        }
        return response || $q.when(response);
      },
      responseError: function (response) {
        if (response.status === 401) {
          console.log('responseError', response);
          $location.path('/login');
        }
        return response || $q.when(response);
      }
    };
  }]);
app.filter('unique', function () {

  return function (arr, field) {
    var o = {}, i, l = arr.length, r = [];
    for (i = 0; i < l; i += 1) {
      o[arr[i][field]] = arr[i];
    }
    for (i in o) {
      r.push(o[i]);
    }
    return r;
  };
});

app.directive('openChat', function () {
  return {
    restrict: 'AEC',
    required: 'ngModel',
    templateUrl: '/scripts/components/chat.html',
    scope: {
      chat: '='
    },
    controller: function ($scope, socket, $rootScope) {
      $scope.messages = [];
      $scope.addMessage = function () {
        $scope.messages.push({user: {name: 'me', id: $rootScope.currentUser.id}, message: $scope.userMessage});
        socket.emit('message', {message: $scope.userMessage});
        $scope.userMessage = "";

      };

      socket.on('new-message', function (data) {
        $scope.messages.push(data);
      });
    },
    link: function ($scope, element, attr, model) {
      console.log($scope.chat);
      console.log(element);
    }
  }
});
