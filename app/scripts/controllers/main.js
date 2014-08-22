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
  $scope.online_users=[];
  $scope.lists=[];
  $scope.syncAudio = false;
  $http.get('http://localhost:3000/api/user')
      .success(function(data, status, headers, config)
      {
	$scope.users= data;
      })
      .error(function(data, status, headers, config)
      {
	  $scope.error = data;
      });
  var updateTrack = function(){
    $scope.syncAudio = true;
    $rootScope.$broadcast('audio.set',  $scope.data[$scope.currentTrack].file,
      $scope.data[$scope.currentTrack],
      $scope.currentTrack,
      $scope.data.length
    );
  };
  
  $scope.updateUser = function(data){
    console.log(data);
    $http.put('http://localhost:3000/api/user/'+data._id, data)
      .success(function(data, status, headers, config)
      {
	$scope.users= data;
      })
      .error(function(data, status, headers, config)
      {
	  $scope.error = data;
      });
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
    console.log($scope.online_users);
    console.log(data.user);
    $scope.online_users.push(data.user);
    console.log($scope.online_users);
    $scope.lists = data.listObjects;
    updateTrack();
  });
  socket.on('user:disconnected',function(data){
    $scope.online_users.push(data.username+  '  disconnected');
  });
  socket.on('user:join',function(data){
    console.log($scope.online_users);
    $scope.online_users.push(data);
    console.log($scope.online_users);
    //updateTrack();
  });
})
.controller('SignUpController', function ($scope, $http, $rootScope, $routeParams) {
  $scope.signup = function(){
    if ($scope.user != undefined) {
      $http.post('http://localhost:3000/api/user', $scope.user)
      .success(function(data, status, headers, config)
      {
	  $rootScope.location.href = '/';

      })
      .error(function(data, status, headers, config)
      {
	  console.log(data);
	  $scope.error = data;
      });
    }
  }
})
.controller('LoginController', function ($scope, $http, $rootScope, $routeParams) {
  $scope.signup = function(){
    if ($scope.user != undefined) {
      $http.post('http://localhost:3000/login', $scope.user)
      .success(function(data, status, headers, config)
      {
	  console.log(data);
      })
      .error(function(data, status, headers, config)
      {
	  console.log(data);
      });
    }
  }
});
