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
          loadAudioData: MainController.loadAudioData
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
  });
  
  app.controller("ErrorController", function($rootScope){
    $rootScope.$on("$routeChangeError", function(event, current, previous, rejection){
        $rootScope.error= rejection;
      })
    });
  
 