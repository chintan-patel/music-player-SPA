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
    'angular-jwt',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'musicPlayerApp.Controllers',
    'musicPlayerApp.Factories',
    'angularFileUpload',
    'audioPlayer-directive'

  ])
  .config(['$routeProvider', '$resourceProvider', '$httpProvider', '$locationProvider', function ($routeProvider, $resourceProvider, $httpProvider, $locationProvider) {
    $httpProvider.defaults.withCredentials = true;


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
          audio: function (AudioFactory, $route) {
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
        redirectTo: '/login'
      });

    $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('authInterceptor');


  }]);

app.run(['$rootScope', '$window', 'jwtHelper', function ($rootScope, $window, jwtHelper) {
  $rootScope.currentUser = (!$window.sessionStorage.token || jwtHelper.isTokenExpired($window.sessionStorage.token)) ? null : jwtHelper.decodeToken($window.sessionStorage.token);
}]);

app.controller('AppController', ['$scope', '$window', '$location', function ($scope, $window, $location) {
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
    if (rejection.status === 403) {
      $location.path('/login');
    }
  });
}]);

