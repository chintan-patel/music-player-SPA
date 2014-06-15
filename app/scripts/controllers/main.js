'use strict';
  
angular.module('musicPlayerApp')
  .filter('startFrom', function() {
    return function(input, start) {
      start = +start; //parse to int
      return input.slice(start);
    };
  })

.controller('MainCtrl', function ($scope, $http, $rootScope, socket) {
  $scope.currentTrack = 0;
  $scope.pageSize = 50;
  $scope.data=[];
  $scope.users=[];
  var updateTrack = function(){
    $rootScope.$broadcast('audio.set', 'mp3/' + $scope.data[$scope.currentTrack].file,
      $scope.data[$scope.currentTrack],
      $scope.currentTrack,
      $scope.data.length
    );
  };

  $rootScope.$on('audio.next', function(){
    $scope.currentTrack++;
    if ($scope.currentTrack < $scope.data.length){
	updateTrack();
    }else{
	$scope.currentTrack=$scope.data.length-1;
    }
  });
  
  socket.on('song:add', function(data){
    $scope.data.push(data);
    updateTrack();
  });

  $rootScope.$on('audio.add',function(data){
    data = {
      "title": "SONG TITLE",
      "artist": {"name": "ARTIST NAME"},
      "image": "images/1920x1080_75.jpeg",
      "file": "83-pahadi_thumri-sample_52745.mp3"
    }
    $scope.data.push(data);
    updateTrack();
    socket.emit('song:add',data,function(){
    });
  });
  $rootScope.$on('audio.prev', function(){
    $scope.currentTrack--;
    if ($scope.currentTrack >= 0){
	updateTrack();
    }else{
	$scope.currentTrack = 0;
    }
  });
  socket.on('user:connected',function(data){
    $scope.data.push(data.song);
    $scope.users.push(data.user);
    updateTrack();
  });
  socket.on('user:disconnected',function(data){
    $scope.users.push(data.name+  "  disconnected");
  });
  socket.on('user:join',function(data){
    $scope.users.push(data);
    updateTrack();
  });

  /*
  $http.get('data/music.json')
    .success(function(response){
	$scope.data = response;
	updateTrack();
  });
  */
});
