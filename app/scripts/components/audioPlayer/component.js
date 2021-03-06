/**
 * Directives
 */

// Audio Player directive
// Handles play/pause/stop/previous behavior
angular.module('audioPlayer-directive', [])
    .directive('audioPlayer', function($rootScope) {
        return {
          restrict: 'AEC',
            scope: {},
            controller: function($scope, $element) {
                $scope.audio = new Audio();
                $scope.currentNum = 0;
                $scope.totalNum = 0;

                // tell others to give me my prev/next track (with audio.set message)
                $scope.next = function(){ $rootScope.$broadcast('audio.next'); };
                $scope.prev = function(){ $rootScope.$broadcast('audio.prev'); };
            //    $scope.add= function(){ $rootScope.$broadcast('audio.add'); };

                // tell audio element to play/pause, you can also use $scope.audio.play() or $scope.audio.pause();
                $scope.playpause = function(){
                    var a = $scope.audio.paused ? $scope.audio.play() : $scope.audio.pause();
                };

                // listen for audio-element events, and broadcast stuff
                $scope.audio.addEventListener('play', function(){ $rootScope.$broadcast('audio.play', this); });
                $scope.audio.addEventListener('pause', function(){ $rootScope.$broadcast('audio.pause', this); });
                $scope.audio.addEventListener('timeupdate', function(){ $rootScope.$broadcast('audio.time', this); });
                $scope.audio.addEventListener('ended', function(){ $rootScope.$broadcast('audio.ended', this); $scope.next(); });

                // set track & play it
                $rootScope.$on('audio.set', function(r, file, info, currentNum, totalNum){
                    var playing = !$scope.audio.paused;
                    $scope.audio.src = file;
                    var a = playing ? $scope.audio.play() : $scope.audio.pause();
                    $scope.info = info;
                    $scope.currentNum = currentNum;
                    $scope.totalNum = totalNum;
                });

                // update display of things - makes time-scrub work
                setInterval(function(){ $scope.$apply(); }, 1000);
            },

            templateUrl: '/scripts/components/audioPlayer/views/component.html'
        };
    });
