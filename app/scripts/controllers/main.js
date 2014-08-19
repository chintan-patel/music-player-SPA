'use strict';
  
angular.module('musicPlayerApp')
  .filter('startFrom', function() {
    return function(input, start) {
      start = +start; //parse to int
      return input.slice(start);
    };
  })
.controller('MainController', function ($scope, $http, $rootScope, socket, $upload) {
  $scope.currentTrack = 0;
  $scope.pageSize = 50;
  $scope.data=[];
  $scope.users=[];
  $scope.lists=[];
  $scope.syncAudio = false;
  var updateTrack = function(){
    $scope.syncAudio = true;
    $rootScope.$broadcast('audio.set',  $scope.data[$scope.currentTrack].file,
      $scope.data[$scope.currentTrack],
      $scope.currentTrack,
      $scope.data.length
    );
  };
  
  $scope.onFileSelect = function($files) {
    for (var i = 0; i < $files.length; i++) {
	var file = $files[i];
	$scope.upload = $upload.upload({
	    url: 'http://localhost:3000/upload', //upload.php script, node.js route, or servlet url
	    method: 'POST',
	    headers: {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Method' : '*'},
	    // withCredentials: true,
	    data: {myObj: $rootScope.myModelObj}
	})
        .progress(function(evt) {
            console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
        })
        .success(function(data, status, headers, config) {
	    console.log(data);
        })
        .error(function(data,status , headers){
	    console.log(data);
	    console.log(status);
        });
    }
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
      'title': 'SONG TITLE',
      'artist': {'name': 'ARTIST NAME'},
      'image': 'images/1920x1080_75.jpeg',
      'file': '83-pahadi_thumri-sample_52745.mp3'
    };
    
    $scope.data.push(data);
    updateTrack();
    socket.emit('song:add',data,function(){});
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
    $scope.lists = data.listObjects;
    console.log($scope.lists);
    updateTrack();
  });
  socket.on('user:disconnected',function(data){
    $scope.users.push(data.name+  '  disconnected');
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
})
.controller('UploadController', function ($scope, $http, $rootScope, socket, $upload, $routeParams) {
  console.log($routeParams);
  $scope.uploadedStatus = 'Success';
});
