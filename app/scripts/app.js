'use strict';

/**
 * @ngdoc overview
 * @name angularjsApp
 * @description
 * # angularjsApp
 *
 * Main module of the application.
 */
var app = angular
  .module('musicPlayerApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'musicPlayerApp.Controllers',
    'musicPlayerApp.Factories',
    'btford.socket-io',
    'angularFileUpload',
    'audioPlayer-directive'
  ])
  .config(['$routeProvider', '$resourceProvider', function ($routeProvider, $resourceProvider) {
    $routeProvider
      .when('/', {
        controller: 'MainController',
        templateUrl: 'views/main.html',
        resolve: {
          loadUserData: function (UsersFactory) {
            return UsersFactory.query().$promise;
          },
          loadPlaylistData: function (PlaylistFactory) {
            return PlaylistFactory.query().$promise;
          },
          loadAudioData: function (AudioFactory) {
            return AudioFactory.query().$promise;
          }
        }
      })
      .when('/audio/edit/:audio_id', {
        templateUrl: 'views/audio_edit.html',
        controller: 'AudioController',
        resolve: {
          audio: function (AudioFactory) {
            return AudioFactory.get({id: $route.current.params.audio_id}).$promise;
          }
        }
      })
      .when('/user/edit/:user_id', {
        templateUrl: 'views/userEdit.html',
        controller: 'UserController',
        resolve: {
          user: function (UserFactory, $route) {
            return UserFactory.get({id: $route.current.params.user_id}).$promise;
          }
        }
      })
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginController'
      })
      .when('/signup', {
        templateUrl: 'views/signup.html',
        controller: 'SignUpController'
      })
      .otherwise({
        redirectTo: '/'
      });

    //$httpProvider.defaults.headers.common['Authorization'] = 'Bearer '+ authorization_token;
  }])
  .run(function ($rootScope, $location, Auth) {
    //watching the value of the currentUser variable.
    $rootScope.$watch('currentUser', function (currentUser) {
      if (!currentUser && (['/', '/login', '/logout', '/signup'].indexOf($location.path()) === -1 )) {
        Auth.currentUser();
      }
    });
  });

app.controller('ErrorController', function ($scope) {
  $scope.isViewLoading = false;
  $scope.errors = [];
  $scope.successMessages = [];
  $scope.$on('$routeChangeStart', function () {
    $scope.isViewLoading = true;
  });
  $scope.$on('$routeChangeSuccess', function () {
    $scope.isViewLoading = false;
  });
  $scope.$on('$routeChangeError', function (event, current, previous, rejection) {
    $scope.errors.push(rejection);
  });
});

