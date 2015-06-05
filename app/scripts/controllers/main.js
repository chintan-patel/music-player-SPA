'use strict';

/**
 *
 * @type {module} controllers
 */
var app = angular.module('musicPlayerApp.Controllers', []);

/**
 * SignUpController for Sign up page
 * Handles POST and Validation of User Sign up
 */
app.controller('SignUpController', ['$scope', '$location', 'UsersFactory', function ($scope, $location, UsersFactory) {
  /**
   * Error Initializer
   */
  $scope.errors = [];
  $scope.successMessages = [];


  /**
   * form submit
   */
  $scope.signUp = function () {

    if ($scope.signUpForm.$invalid) {
      $scope.errors.length = 0;
      $scope.errors.push('Please fill all required fields');
      return false;
    }
    var nameSplit = $scope.signUpForm.name.$viewValue.split(' ');
    $scope.user.first_name = nameSplit.slice(0, 1).pop();
    $scope.user.last_name = nameSplit.slice(1).join(' ');

    if ($scope.user !== undefined) {

      var promise = UsersFactory.save($scope.user).$promise;
      promise
        .then(function (result) {
          $location.path('/login');
        })
        .catch(function (err) {
          $scope.errors.length = 0;
          $scope.errors.push(err.data);
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
app.controller('LoginController', ['$scope', '$location', '$http', '$rootScope', '$routeParams', '$window', 'jwtHelper', 'Auth', function ($scope, $location, $http, $rootScope, $routeParams, $window, jwtHelper, Auth) {
  $scope.errors = [];

  // New
  $scope.submit = function () {
    var auth = Auth.save($scope.user).$promise;
    auth.then(function (result) {
      $window.sessionStorage.token = result.token;
      $rootScope.currentUser = jwtHelper.decodeToken(result.token);
      $location.path('/');
    })
      .catch(function (err) {
        delete $window.sessionStorage.token;
        $rootScope.currentUser = {};
        $scope.errors.push({msg: err});
      });

  };
}]);

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
        $location.path('/');
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
app.controller('MainController', ['$scope', '$route', '$http', '$rootScope', 'socket', '$upload', 'loadUserData', 'loadAudioData', 'loadPlaylistData', 'UserFactory', '$window', '$location', '$filter', function ($scope, $route, $http, $rootScope, socket, $upload, loadUserData, loadAudioData, loadPlaylistData, UserFactory, $window, $location, $filter) {

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
  $scope.lists = [];
  $scope.files = [];

  $scope.isUploadVisible = false;
  $scope.isOnlineUserVisible = false;

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
    if (dataNew.audio_ids === 'undefined') {
      dataNew.audio_ids = [];
    }
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

  $scope.loggedInUsers = [];
  socket.on('authenticated', function (payload) {
    $scope.loggedInUsers = payload.msg;

  });

  $scope.chats = [];
  $scope.openChat = function (user) {
    if ($scope.chats.indexOf(user) <= -1) {
      $scope.chats.push(user);
    }
  };

  $scope.messages = [];
  $scope.addMessage = function () {
    $scope.messages.push({user: {name: 'me', id: $rootScope.currentUser.id}, message: $scope.userMessage});
    socket.emit('message', {message: $scope.userMessage});
    $scope.userMessage = "";

  };

  socket.on('new-message', function (data) {
    $scope.messages.push(data);
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
  });

  // Socket listener if user goes offline
  socket.on('user:disconnected', function (data) {
    $scope.onlineUsers.push(data.username + '  disconnected');
  });

  // Socket listener if user joins the channel
  socket.on('user:join', function (data) {
    $scope.onlineUsers.push(data);
  });


  //Logout user
  $rootScope.logout = function () {
    delete $window.sessionStorage.token;
    $rootScope.currentUser = null;
    $location.path('/login');
  }
}]);
