'use strict';

/**
 *
 * @type {module} Controllers
 */
var app = angular.module('musicPlayerApp.Controllers', []);

/**
 * SignUpController for Sign up page
 * Handles POST and Validation of User Sign up
 */
app.controller('SignUpController', ['$scope', '$location', 'UsersFactory', function ($scope, $location, UsersFactory) {
  /**
   * form submit
   */
  $scope.signUp = function () {

    $scope.user.firstName = name.substr(0, $scope.user.name.indexOf(' '));
    $scope.user.lastName = name.substr($scope.user.name.indexOf(' ') + 1);

    if ($scope.user !== undefined) {

      var promise = UsersFactory.save($scope.user).$promise;
      promise
        .then(function (result) {
          console.log(result);
          $location.path('#/home');
        })
        .catch(function (err) {
          $scope.errors = data;
        });
    }
  };
}]);

/**
 * AudioController
 * Handles interaction with Audio Module updates
 */
app.controller('AudioController', ['$scope', 'audio', 'AudioFactory', function ($scope, audio, AudioFactory) {
  $scope.audio = audio;

  /**
   * UpdateAudio - updates the audio information
   * @param index
   */
  $scope.updateAudio = function (index) {

    var audio = $scope.audio[index];
    var promise = AudioFactory.update({id: audio._id}, {
      name: audio.name,
      user_id: audio.user_id,
      key: audio.key,
      image: audio.image,
      delete: audio.delete
    }).$promise;
    promise
      .then(function (result) {
        console.log(result);
        $location.path('#/home');
      })
      .catch(function (err) {
        $scope.errors = data;
      });
  }
}]);

/**
 * LoginController
 * Handles the Login using session
 */
app.controller('LoginController', function ($scope, $location, $http, $rootScope, $routeParams, Auth) {
  $scope.login = function () {
    if ($scope.user !== undefined) {
      var data = {
        username: $scope.user.username,
        password: $scope.user.password,
        rememberMe: $scope.user.rememberMe
      };
      // Login user if password matches
      Auth.login('password', data, function (err) {

        // Error redirect to login
        if (err) {
          $scope.errors.push(err);
          $location.path('#/login');
        }
        else {
          // Success redirect to home
          $location.path('#/');
        }
      });
    }
  };
});

/**
 * UserController
 * Handles the updates/upload for user profile
 */
app.controller('UserController', ['$scope', '$location', 'user', 'UserFactory', '$upload',
  function ($scope, $location, user, UserFactory, $upload) {

    // Initialize the variable with 'user' value from
    // resolve function in config
    $scope.user = user;

    /**
     * updateUser
     * Handles update of user model
     */
    $scope.updateUser = function () {
      var promise = UserFactory.update({id: user._id}, {
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username
      }).$promise;
      promise.then(function (result) {
        console.log(result);
        $location.path('#/');
      })
        .catch(function (err) {
          console.log(err);
        })
    };

    /**
     * onFileSelect - onChange event listener from upload directives
     * @param $files
     */
    $scope.onFileSelect = function ($files) {

      // Initalize files
      $scope.files = $files;

      // Iterate each file for uploading
      for (var i = 0; i < $files.length; i++) {
        var file = $files[i];

        // $upload - refer to bower.json
        // callback functions - showProgress, showSuccess, showError
        $scope.upload =
          $upload.upload({
            url: '/api/user/' + $scope.user._id + '/upload', //upload.php script, node.js route, or servlet url
            fields: {id: $scope.user._id},
            file: file
          })
            .progress(showProgress(event))
            .success(showSuccess(event))
            .error(showError(event));
      }
    };

    // Feedback of upload using Progress bar
    function showProgress(event) {
      console.log(event);
    }

    // Feedback if Error occurs on upload
    function showError(data) {
      $scope.errors = data;
    }

    // Success listener if successful uploaded file
    function showSuccess(data) {
      $scope.errors.push({message: data + ' uploaded !'});
    }
  }]);

/**
 * MainController
 * Core controller of app, which handles all the UI interaction
 */
app.controller('MainController', ['$scope', '$route', '$http', '$rootScope', 'socket', '$upload', 'loadUserData', 'loadAudioData', 'loadPlaylistData', 'UserFactory', function ($scope, $route, $http, $rootScope, socket, $upload, loadUserData, loadAudioData, loadPlaylistData, UserFactory) {

  // Initalize variables
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

  /**
   * showOnlineUsers
   * Show/Hide the online user block
   */
  $scope.showOnlineUsers = function () {
    $scope.newUsers.length = 0;
    $scope.isOnlineUserVisible = !$scope.isOnlineUserVisible;
  };

  /**
   * Preload the user, playlists and audio data
   */
  $scope.userData = angular.copy(loadUserData);
  $scope.playlistData = angular.copy(loadPlaylistData);
  $scope.audioData = angular.copy(loadAudioData);

  // Push the user data to users Array
  angular.forEach($scope.userData, function (data) {
    if (data.hasOwnProperty('_id')) {
      data.show = false;
      $scope.users.push(data);
    }
  });

  // Push the playlistData to playlist Array
  angular.forEach($scope.playlistData, function (data) {
    if (data.hasOwnProperty('_id')) {
      data.show = false;
      $scope.playlist.push(data);
    }
  });
  console.log($scope.playlist);

  angular.forEach($scope.audioData, function (data) {
    if (data.hasOwnProperty('_id')) {
      data.show = false;
      $scope.lists.push(data);
    }
  });

  /**
   * updateTrack
   * Initialize the broadcast listeners for audio player
   */
  var updateTrack = function () {
    $rootScope.$broadcast('audio.set', $scope.currentPlaylist.audio_ids[$scope.currentTrack].key,
      $scope.currentPlaylist.audio_ids[$scope.currentTrack],
      $scope.currentTrack,
      $scope.currentPlaylist.audio_ids.length
    );
  };


  /**
   * selectPlaylist - Selects the Playlist from the list
   * @param id
   */
  $scope.selectPlaylist = function (id) {
    if ($scope.playlist.length <= 0) {
      $scope.errors.push({message: 'No Playlist added'});
    }
    else {
      // Assign the playlist selected to currentPlaylist
      // currentPlaylist will hold the list of audio to play
      $scope.currentPlaylist = $scope.playlist[id];
      $scope.currentTrack = 0;
      if ($scope.currentPlaylist.audio_ids.length) {
        // updateTrack will update the audio player directive with
        // new playlist
        updateTrack();
      }
      else {
        // Show error if the audio playlist is empty
        // This handles the case when 'default playlist == empty'
        $scope.errors.push({message: 'Please add audio in playlist'});
      }
    }
  };

  /**
   * add() - Add to new audio after uploading to current playlist
   * @param data
   */
  $scope.add = function (data) {
    var dataNew = $scope.currentPlaylist;
    dataNew.audio_ids.push(data);

    // Update the playlist model with newly added audio
    $http.put('/api/playlist/' + $scope.currentPlaylist._id, dataNew)
      .success(function () {
        $scope.currentPlaylist = dataNew;
        for (var i = 0; i < $scope.playlist.length; i++) {
          if ($scope.playlist[i]._id === $scope.currentPlaylist._id) {
            $scope.playlist[i] = $scope.currentPlaylist;
          }
        }
        // update the track after successfully adding audio
        // to currentPlaylist
        updateTrack();
      })
      .error(function (data) {
        $scope.errors = data;
      });
  };


  /**
   * toggleEditAudio - Show/Hide audio for updates
   * @param _id
   */
  $scope.toggleEditAudio = function (_id) {
    $scope.lists[_id].show = !$scope.lists[_id].show;
  };

  /**
   * clear - delete the playlist and updates currentPlaylist from audio player
   */
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
        $scope.errors = data;
      });
  };

  /**
   * updateUser - Update User
   * @param data
   */
  $scope.updateUser = function (data) {
    $http.put('/api/user/' + data._id, data)
      .success(function (data) {
        $scope.users = data;
      })
      .error(function (data) {
        $scope.errors = data;
      });
  };

  /**
   * deleteAudio - Delete Audio
   * @param data
   */
  $scope.deleteAudio = function (id) {
    $http.delete('/api/audio/' + id)
      .success(function (data) {
        $scope.alert.message = 'Updated';
        $scope.alert = true;
        delete $scope.lists[data._id];

      })
      .error(function (data) {
        $scope.errors = data;
      });
  };

  /**
   * deleteUser - Delete User
   * @param data
   */
  $scope.deleteUser = function (id) {
    var user = $scope.users[id];
    var promise = UserFactory.update({id: user._id}, {delete: true}).$promise;
    promise
      .then(function (data) {
        $scope.alert.message = 'Updated';
        $scope.users.splice(id, 1);
      })
      .catch(function (data) {
        $scope.errors = data;
      });
  };

  /**
   * onFileSelect - Handles audio file upload
   * @param $files
   */
  $scope.onFileSelect = function ($files) {
    $scope.files = $files;
    for (var i = 0; i < $files.length; i++) {
      var file = $files[i];
      $scope.upload =
        $upload.upload({
          url: '/api/audio/upload', //upload.php script, node.js route, or servlet url
          fields: {playlist: $scope.playlist},
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
    $scope.errors = data;
  }

  function showSuccess(data) {
    $scope.successMessages.push({message: data + ' uploaded !'});
  }

  // audio.next listener from audioplayer directives
  $rootScope.$on('audio.next', function () {
    $scope.currentTrack++;
    if ($scope.currentTrack < $scope.currentPlaylist.audio_ids.length) {
      updateTrack();
    } else {
      $scope.currentTrack = $scope.currentPlaylist.audio_ids.length - 1;
    }
  });

  // Update track on Song Added by peer listener
  // Using socket.io for real-time communication
  socket.on('song:add', function (data) {
    console.log('song:add');
    $scope.playlist.push(data);
    updateTrack();
  });

  // Update track of other users after new audio is added
  // Using socket to emit the event (notify node)
  $rootScope.$on('audio.add', function (data) {
    $scope.playlist.push(data);
    updateTrack();
    socket.emit('song:add', data, function () {
    });
  });

  // Audio << previous button listener
  $rootScope.$on('audio.prev', function () {
    $scope.currentTrack--;
    if ($scope.currentTrack >= 0) {
      updateTrack();
    } else {
      $scope.currentTrack = 0;
    }
  });

  // Socket listener if new user is online
  socket.on('user:connected', function (data) {
    $scope.onlineUsers.push(data.user);
    //updateTrack();
  });

  // Socket listener if user goes offline
  socket.on('user:disconnected', function (data) {
    $scope.onlineUsers.push(data.username + '  disconnected');
    $scope.newUsers.length = $scope.newUsers.length - 1;
  });

  // Socket listener if user joins the channel
  socket.on('user:join', function (data) {
    $scope.onlineUsers.push(data);
    $scope.newUsers.push(data);
  });
}]);

