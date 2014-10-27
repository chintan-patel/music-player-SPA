'use strict';
  
var SignUpController = app.controller('SignUpController', function ($scope, $location, $http, $rootScope, $routeParams) {
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
	  $rootScope.error = data;
      });
    }
  }
});

var AudioController= app.controller('AudioController', function ($q, $scope, $http, $location, $rootScope, $routeParams) {
  $scope.audio = [];
  $scope.$on('$routeChangeSuccess', function() {
      $http.get('/api/audio/' + $routeParams.audio_id)
      .success(function(data, status, headers, config)
      {
	  $scope.audio = data;
      })
      .error(function(data, status, headers, config)
      {
	  $scope.audio = data;
      });
  });
  
  
  $scope.updateAudio = function(index){
    $http.put('/api/audio/' + index, $scope.audio)
      .success(function(data, status, headers, config)
      {
	$location.path('/home');
      })
      .error(function(data, status, headers, config)
      {
	$location.path('/');
      });
  }
});

  
var LoginController= app.controller('LoginController', function ($scope, $http, $rootScope, $routeParams) {
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
	  $rootScope.error = data;
	  $location.path('/login');
      });
    }
  }
});

var MainController = app.controller('MainController', function ($scope, $route, $http, $rootScope, socket, $upload) {
  $scope.current_playlist = [];
  $scope.currentTrack = 0;
  $scope.pageSize = 50;
  $scope.alert= [];
  $scope.alert.message = '';
  $scope.playlist=[];
  $scope.users=[];
  $scope.upload_model=[];
  $scope.online_users=[];
  $scope.new_users=[];
  $scope.lists=[];
  $scope.files= [];
  
  $scope.isUploadVisible = false;
  $scope.isOnlineUserVisible= false;
  
  $scope.showOnlineUsers = function(){
      $scope.new_users.length = 0;
      $scope.isOnlineUserVisible = !$scope.isOnlineUserVisible
  };
  // PreLoad User data
  $scope.users = $route.current.locals.loadUserData;
  $scope.playlist = $route.current.locals.loadPlaylistData;
  
  $scope.lists = $route.current.locals.loadAudioData;
  
  angular.forEach($scope.lists, function(data,key){
      data.show = false;
  });
  
   var updateTrack = function(){
    $rootScope.$broadcast('audio.set',  $scope.current_playlist.audio_ids[$scope.currentTrack].key,
      $scope.current_playlist.audio_ids[$scope.currentTrack],
      $scope.currentTrack,
      $scope.current_playlist.audio_ids.length
    );
  };
  
  
  $scope.selectPlaylist = function(id){
    if ($scope.playlist.length <= 0) {
      $rootScope.error = 'No Playlist added';
    }
    else
    {
      $scope.current_playlist = $scope.playlist[id];
      $scope.currentTrack = 0;
      if ($scope.current_playlist.audio_ids.length) {
	updateTrack();
      }
      else
      {
	 $rootScope.error = 'Please Add audio in playlist';
      }
    }
  };
  $scope.add = function(data){
    var data_new = $scope.current_playlist;
    data_new.audio_ids.push(data);
    $http.put('/api/playlist/'+$scope.current_playlist._id, data_new)
      .success(function(data, status, headers, config)
      {
	$scope.current_playlist = data_new;
	for(var i =0 ; i < $scope.playlist.length; i++)
	{
	  if ($scope.playlist[i]._id == $scope.current_playlist._id) {
	    $scope.playlist[i] = $scope.current_playlist;
	  }
	}
	updateTrack();
      })
      .error(function(data, status, headers, config)
      {
	  $rootScope.error = data;
      });
  };
  
  
  
  $scope.toggleEditAudio= function(_id){
    $scope.lists[_id].show = !$scope.lists[_id].show;
  }
  
  
  $scope.clear = function(id){
    $http.delete('/api/playlist/'+$scope.current_playlist._id)
      .success(function(data, status, headers, config)
      {
	$scope.current_playlist.length = 0;
	for(var i =0 ; i < $scope.playlist.length; i++)
	{
	  if ($scope.playlist[i]._id == $scope.current_playlist._id) {
	    $scope.playlist.splice(i,0);
	  }
	}
	updateTrack();
      })
      .error(function(data, status, headers, config)
      {
	  $rootScope.error = data;
      })
  };
  
  $scope.updateUser = function(data){
    $http.put('/api/user/'+data._id, data)
      .success(function(data, status, headers, config)
      {
	$scope.users= data;
      })
      .error(function(data, status, headers, config)
      {
	  $rootScope.error = data;
      });
  };
  
  $scope.deleteAudio = function(id){
    $http.delete('/api/audio/'+id)
      .success(function(data, status, headers, config)
      {
	$scope.alert.message = 'Updated'
	$scope.alert = true;
	delete $scope.lists[data._id];
	
      })
      .error(function(data, status, headers, config)
      {
	  $rootScope.error = data;
      });
  }
  
  $scope.deleteUser = function(id){
    $http.delete('/api/user/'+id)
	.success(function(data, status, headers, config)
	{
	  $scope.alert.message = 'Updated'
	  $scope.alert = true;
	  delete $scope.users[data._id];
	})
	.error(function(data, status, headers, config)
	{
	  $rootScope.error = data;
	});
  }
  
  $scope.onFileSelect = function($files) {
    $scope.files = $files;
    for (var i = 0; i < $files.length; i++) {
	var file = $files[i];
	$scope.upload = $upload.upload({
	    url: '/api/upload', //upload.php script, node.js route, or servlet url
	    method: 'POST',
	    data:  {playlist : $scope.myModelObj},
	    file: file
	})
        .progress(function(evt) {
        })
        .success(function(data, status, headers, config) {
	    $rootScope.error = 'Success uploading ' +  data.name;
	    $scope.lists[data._id] = data;
	    $scope.files.length = $scope.files.length - 1;
	    
	    
        })
        .error(function(data,status , headers){
	    $rootScope.error = data;
        });
    }
  };

  $rootScope.$on('audio.next', function(){
    $scope.currentTrack++;
    if ($scope.currentTrack < $scope.current_playlist.audio_ids.length){
	updateTrack();
    }else{
	$scope.currentTrack=$scope.current_playlist.audio_ids.length-1;
    }
  });
  
  socket.on('song:add', function(data){
    console.log("song:add");
    $scope.playlist.push(data);
    updateTrack();
  });

  $rootScope.$on('audio.add',function(data){
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
    $scope.online_users.push(data.user);
    //updateTrack();
  });
  socket.on('user:disconnected',function(data){
    $scope.online_users.push(data.username+  '  disconnected');
    $scope.new_users.length = $scope.new_users.length - 1;
  });
  socket.on('user:join',function(data){
    $scope.online_users.push(data);
    $scope.new_users.push(data);

  });
});
MainController.loadAudioData =   function($q, $http){
    var defer = $q.defer();
    $http.get('/api/audio')
      .success(function(data, status, headers, config)
      {
	  defer.resolve(data);
      })
      .error(function(data, status, headers, config)
      {
	  defer.reject('Cannot Connect: Network Issues');
      });
  return defer.promise;
}


MainController.loadUserData =   function($q, $http){
    var defer = $q.defer();
    $http.get('/api/user')
      .success(function(data, status, headers, config)
      {
	  defer.resolve(data);
      })
      .error(function(data, status, headers, config)
      {
	  defer.reject('Cannot Connect: Network Issues');
      });
      return defer.promise;
}


MainController.loadPlaylistData=   function($q, $http){
    var defer = $q.defer();
    $http.get('/api/playlist')
      .success(function(data, status, headers, config)
      {
	if (data.length <= 0) {
	  $http.post('/api/playlist', {
	    'name' : '\[Default Playlist\]',
	    'audio_ids' : []
	  })
	  .success(function(data, status, headers, config)
	  {
	    var temp_array = [];
	    temp_array.push(data);
	    defer.resolve(temp_array);
	  })
	  .error(function(data, status, headers, config)
	  {
	    defer.reject('Cannot Connect: Network Issues');
	  });
	}
	else
	{
	    defer.resolve(data);
	}
      })
      .error(function(data, status, headers, config)
      {
	  defer.reject('Cannot Connect: Network Issues');
      });
      return defer.promise;
}





