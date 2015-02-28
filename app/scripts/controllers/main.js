'use strict';

var app = angular.module('musicPlayerApp.Controllers', []);

app.controller('SignUpController', function ($scope, $location, $http, $rootScope) {
  $scope.signUp = function () {

    $scope.user.firstName = name.substr(0, $scope.user.name.indexOf(' '));
    $scope.user.lastName = name.substr($scope.user.name.indexOf(' ') + 1);

    if ($scope.user !== undefined) {
      $http.post('/api/user', $scope.user)
        .success(function () {
          $location.path('/home');

        })
        .error(function (data) {
          $rootScope.errors = data;
        });
    }
  };
});
app.controller('AudioController', ['$q', '$scope', '$http', '$location', '$rootScope', '$routeParams',
  function ($q, $scope, $http, $location, $rootScope, $routeParams) {
    $scope.audio = [];
    $scope.$on('$routeChangeSuccess', function () {
      $http.get('/api/audio/' + $routeParams.audioId)
        .success(function (data) {
          $scope.audio = data;
        })
        .error(function (data) {
          $scope.audio = data;
        });
    });


    $scope.updateAudio = function (index) {
      $http.put('/api/audio/' + index, $scope.audio)
        .success(function () {
          $location.path('/home');
        })
        .error(function () {
          $location.path('/');
        });
    };
  }]);
app.controller('LoginController', function ($scope, $location, $http, $rootScope, $routeParams, Auth) {
  $scope.login = function () {
    if ($scope.user !== undefined) {
      var data = {
        username: $scope.user.username,
        password: $scope.user.password,
        rememberMe: $scope.user.rememberMe
      };
      Auth.login('password', data, function (err) {
        if (err) {
          $scope.errors.push(err);
          $location.path('/login');
        }
        else {
          $location.path('/');
        }
      });
    }
  };
});
app.controller('MainController', function ($scope, $route, $http, $rootScope, socket, $upload) {
  $scope.currentPlaylist = [];
  $scope.currentTrack = 0;
  $scope.pageSize = 50;
  $scope.alert = [];
  $scope.alert.message = '';
  $scope.playlist = [];
  $scope.users = [];
  $scope.uploadModel = [];
  $scope.onlineUsers = [];
  $scope.newUsers = [];
  $scope.lists = [];
  $scope.files = [];

  $scope.isUploadVisible = false;
  $scope.isOnlineUserVisible = false;

  $scope.showOnlineUsers = function () {
    $scope.newUsers.length = 0;
    $scope.isOnlineUserVisible = !$scope.isOnlineUserVisible;
  };
  // PreLoad User data
  $scope.users = $route.current.locals.loadUserData;
  $scope.playlist = $route.current.locals.loadPlaylistData;

  $scope.lists = $route.current.locals.loadAudioData;

  angular.forEach($scope.lists, function (data) {
    data.show = false;
  });

  var updateTrack = function () {
    $rootScope.$broadcast('audio.set', $scope.currentPlaylist.audioIds[$scope.currentTrack].key,
      $scope.currentPlaylist.audioIds[$scope.currentTrack],
      $scope.currentTrack,
      $scope.currentPlaylist.audioIds.length
    );
  };


  $scope.selectPlaylist = function (id) {
    if ($scope.playlist.length <= 0) {
      $rootScope.errors.push({message: 'No Playlist added'});
    }
    else {
      $scope.currentPlaylist = $scope.playlist[id];
      $scope.currentTrack = 0;
      if ($scope.currentPlaylist.audioIds.length) {
        updateTrack();
      }
      else {
        $rootScope.errors.push({message: 'Please add audio in playlist'});
      }
    }
  };
  $scope.add = function (data) {
    var dataNew = $scope.currentPlaylist;
    dataNew.audioIds.push(data);
    $http.put('/api/playlist/' + $scope.currentPlaylist._id, dataNew)
      .success(function () {
        $scope.currentPlaylist = dataNew;
        for (var i = 0; i < $scope.playlist.length; i++) {
          if ($scope.playlist[i]._id === $scope.currentPlaylist._id) {
            $scope.playlist[i] = $scope.currentPlaylist;
          }
        }
        updateTrack();
      })
      .error(function (data) {
        $rootScope.errors = data;
      });
  };


  $scope.toggleEditAudio = function (_id) {
    $scope.lists[_id].show = !$scope.lists[_id].show;
  };


  $scope.clear = function () {
    $http.delete('/api/playlist/' + $scope.currentPlaylist._id)
      .success(function () {
        $scope.currentPlaylist.length = 0;
        for (var i = 0; i < $scope.playlist.length; i++) {
          if ($scope.playlist[i]._id === $scope.currentPlaylist._id) {
            $scope.playlist.splice(i, 0);
          }
        }
        updateTrack();
      })
      .error(function (data) {
        $rootScope.errors = data;
      });
  };

  $scope.updateUser = function (data) {
    $http.put('/api/user/' + data._id, data)
      .success(function (data) {
        $scope.users = data;
      })
      .error(function (data) {
        $rootScope.errors = data;
      });
  };

  $scope.deleteAudio = function (id) {
    $http.delete('/api/audio/' + id)
      .success(function (data) {
        $scope.alert.message = 'Updated';
        $scope.alert = true;
        delete $scope.lists[data._id];

      })
      .error(function (data) {
        $rootScope.errors = data;
      });
  };

  $scope.deleteUser = function (id) {
    $http.delete('/api/user/' + id)
      .success(function (data) {
        $scope.alert.message = 'Updated';
        $scope.alert = true;
        delete $scope.users[data._id];
      })
      .error(function (data) {
        $rootScope.errors = data;
      });
  };

  $scope.onFileSelect = function ($files) {
    $scope.files = $files;
    for (var i = 0; i < $files.length; i++) {
      var file = $files[i];
      $scope.upload =
        $upload.upload({
          url: '/api/upload', //upload.php script, node.js route, or servlet url
          method: 'POST',
          data: {playlist: $scope.playlist},
          file: file
        })
          .progress(showProgress(event))
          .success(showSuccess(event))
          .error(showError(event));
    }
  };
  function showProgress(event) {
    console.log(event);
  }

  function showError(data) {
    $rootScope.errors = data;
  }

  function showSuccess(data) {
    $rootScope.errors.push({message: data.name + ' uploaded !'});
    $scope.lists[data._id] = data;
    $scope.files.length = $scope.files.length - 1;
  }

  $rootScope.$on('audio.next', function () {
    $scope.currentTrack++;
    if ($scope.currentTrack < $scope.currentPlaylist.audioIds.length) {
      updateTrack();
    } else {
      $scope.currentTrack = $scope.currentPlaylist.audioIds.length - 1;
    }
  });

  socket.on('song:add', function (data) {
    console.log('song:add');
    $scope.playlist.push(data);
    updateTrack();
  });

  $rootScope.$on('audio.add', function (data) {
    $scope.playlist.push(data);
    updateTrack();
    socket.emit('song:add', data, function () {
    });
  });
  $rootScope.$on('audio.prev', function () {
    $scope.currentTrack--;
    if ($scope.currentTrack >= 0) {
      updateTrack();
    } else {
      $scope.currentTrack = 0;
    }
  });
  socket.on('user:connected', function (data) {
    $scope.onlineUsers.push(data.user);
    //updateTrack();
  });
  socket.on('user:disconnected', function (data) {
    $scope.onlineUsers.push(data.username + '  disconnected');
    $scope.newUsers.length = $scope.newUsers.length - 1;
  });
  socket.on('user:join', function (data) {
    $scope.onlineUsers.push(data);
    $scope.newUsers.push(data);

  });
});

