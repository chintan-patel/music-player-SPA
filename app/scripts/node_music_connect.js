/**
*  * Module dependencies
*   
*   */
var express = require('express');
var app = module.exports = express();
var connect = require('connect');
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

/**
*  * Configuration
*   */

app.set('port', process.env.PORT || 3000);

// development only
if (app.get('env') === 'development') {
  app.use(connect.errorHandler({ dumpExceptions: true, showStack: true }));
}

// production only
if (app.get('env') === 'production') {
  // TODO
};


// Socket.io Communication
io.sockets.on('connection', function(socket)
{
  // send the new user their name and a list of users
  socket.emit('user:connected', {
    song: {
      "title": "SONG TITLE",
      "artist": {"name": "ARTIST NAME"},
      "image": "images/1920x1080_75.jpeg",
      "file": "83-pahadi_thumri-sample_52745.mp3"
    },
    user : {
      name : socket.id,
      joined_date:  new Date().toDateString() + " " + new Date().toTimeString()
    }
    });

  // notify other clients that a new user has joined
  socket.broadcast.emit('user:join', {
    name : socket.id,
    joined_date:  new Date().toDateString() + " " + new Date().toTimeString()
  });

  // broadcast a user's message to other users
  socket.on('song:add', function (data) {
    socket.broadcast.emit('song:add', data);
  });

  // clean up when a user leaves, and broadcast it to other users
  socket.on('user:disconnected', function () {
    socket.broadcast.emit('user:left', {
      'user' : socket.id
      });
  });
});

/**
* Start Server
*/

server.listen(app.get('port'), function () {
console.log('Express server listening on port ' + app.get('port'));
});
