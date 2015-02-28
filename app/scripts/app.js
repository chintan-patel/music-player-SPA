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
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider
      .when('/', {
          templateUrl: 'views/main.html',
        resolve: {
          loadUserData: function (MainFactory) {
            return MainFactory.loadUserData;
          },
          loadPlaylistData: function (MainFactory) {
            return MainFactory.loadPlaylistData;
          },
          loadAudioData: function (MainFactory) {
            return MainFactory.loadAudioData;
          }
          }
      })
      .when('/audio/edit/:audio_id', {
          templateUrl: 'views/audio_edit.html',
          controller: 'AudioController'
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
    $scope.$on('$routeChangeStart', function() {
      $scope.isViewLoading = true;
    });
    $scope.$on('$routeChangeSuccess', function() {
      $scope.isViewLoading = false;
    });
  $scope.$on('$routeChangeError', function (event, current, previous, rejection) {
    $scope.errors.push(rejection);
  });
    });

