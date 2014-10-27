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
    'btford.socket-io',
    'angularFileUpload',
    'audioPlayer-directive'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
          templateUrl: 'views/main.html',
          controller: 'MainController',
          resolve :{
              loadUserData: MainController.loadUserData,
              loadPlaylistData: MainController.loadPlaylistData,
              loadAudioData: MainController.loadAudioData
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
  });
  
  app.controller("ErrorController", function($scope){
    $scope.isViewLoading = false;
    $scope.$on('$routeChangeStart', function() {
      $scope.isViewLoading = true;
    });
    $scope.$on('$routeChangeSuccess', function() {
      $scope.isViewLoading = false;
    });
    $scope.$on("$routeChangeError", function(event, current, previous, rejection){
        $scope.error= rejection;
      })
    });
  
 