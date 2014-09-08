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
  $scope.alert= false;
  $scope.alert.message = '';
  $scope.playlist=[];
  $scope.users=[];
  $scope.upload_model=[];
  $scope.online_users=[];
  $scope.lists=[];
  $scope.syncAudio = false;
  $http.get('/api/user')
      .success(function(data, status, headers, config)
      {
	$scope.users= data;
      })
      .error(function(data, status, headers, config)
      {
	  $scope.error = data;
      });
  $http.get('/api/audio')
      .success(function(data, status, headers, config)
      {
	$scope.lists= data;
      })
      .error(function(data, status, headers, config)
      {
	  $scope.error = data;
      });
  var updateTrack = function(){
    $scope.syncAudio = true;
    $rootScope.$broadcast('audio.set',  $scope.playlist[$scope.currentTrack].file,
      $scope.playlist[$scope.currentTrack],
      $scope.currentTrack,
      $scope.playlist.length
    );
  };
  
  $scope.add = function(data){
    $scope.playlist.push(data);
  };
  
  $scope.clear = function(){
    $scope.playlist = [];
  };
  
  $scope.updateUser = function(data){
    $http.put('/api/user/'+data._id, data)
      .success(function(data, status, headers, config)
      {
	$scope.users= data;
      })
      .error(function(data, status, headers, config)
      {
	  $scope.error = data;
      });
  };
  
  $scope.deleteAudio = function(id){
    $http.delete('/api/audio/'+id)
      .success(function(data, status, headers, config)
      {
	console.log(data);
	$scope.alert.message = 'Updated'
	$scope.alert = true;
	delete $scope.lists[data._id];
	
      })
      .error(function(data, status, headers, config)
      {
	  $scope.error = data;
      });
  }
  
  $scope.onFileSelect = function($files) {
    for (var i = 0; i < $files.length; i++) {
	var file = $files[i];
	$scope.upload = $upload.upload({
	    url: '/api/upload', //upload.php script, node.js route, or servlet url
	    method: 'POST',
	    data:  {playlist : $scope.myModelObj},
	    file: file
	})
        .progress(function(evt) {
            console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
        })
        .success(function(data, status, headers, config) {
	  console.log(data);
	  $scope.alert = true;
	    //$scope.lists.push(data);
	    $scope.lists[data._id] = data;
	    console.log($scope.lists);
	    
        })
        .error(function(data,status , headers){
	   $scope.alert = true;
	   $scope.alert.message = data;
        });
    }
  };

  $rootScope.$on('audio.next', function(){
    $scope.currentTrack++;
    if ($scope.currentTrack < $scope.playlist.length){
	updateTrack();
    }else{
	$scope.currentTrack=$scope.playlist.length-1;
    }
  });
  
  socket.on('song:add', function(data){
    $scope.playlist.push(data);
    updateTrack();
  });

  $rootScope.$on('audio.add',function(data){
    data = {
      'name': 'SONG TITLE',
      'user_id': {'name': 'ARTIST NAME'},
      'image': 'images/1920x1080_75.jpeg',
      'key': '83-pahadi_thumri-sample_52745.mp3'
    };
    
    $scope.playlist.push(data);
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
    $scope.playlist.push(data.song);
    $scope.online_users.push(data.user);
    updateTrack();
  });
  socket.on('user:disconnected',function(data){
    $scope.online_users.push(data.username+  '  disconnected');
  });
  socket.on('user:join',function(data){
    $scope.online_users.push(data);
  });
})
.controller('SignUpController', function ($scope, $location, $http, $rootScope, $routeParams) {
  $scope.signup = function(){
    var first_name = $scope.user.name;
    var last_name = $scope.user.name;
    
    $scope.user.first_name = name.substr(0,$scope.user.name.indexOf(' '));
    $scope.user.last_name = name.substr($scope.user.name.indexOf(' ')+1);
    
    if ($scope.user != undefined) {
      $http.post('/api/user', $scope.user)
      .success(function(data, status, headers, config)
      {
	$location.path('/home');

      })
      .error(function(data, status, headers, config)
      {
	  $scope.error = data;
      });
    }
  }
})
.controller('LoginController', function ($scope, $http, $rootScope, $routeParams) {
  $scope.login = function() {
    if ($scope.user != undefined) {
      var data = {'username' : $scope.user.username, 'password' : $scope.user.password };
      $http.post('/api/login', data)
      .success(function(data, status, headers, config)
      {
	  $location.path('/home');
      })
      .error(function(data, status, headers, config)
      {
	  $location.path('/login');
      });
    }
  }
});
