module.exports.socketConnection = function (socket, user) {

  socket.on('audio.set', function (data) {
    socket.broadcast.emit('audio.set', data)
  });
  socket.on('audio.play', function () {
  });
  socket.on('audio.pause', function () {
  });

  // broadcast a user's message to other users
  socket.on('song:add', function (data) {
    socket.broadcast.emit('song:add', data);
  });

  // clean up when a user leaves, and broadcast it to other users
  socket.on('user:disconnected', function () {
    socket.broadcast.emit('user:left', {
      'username': socket.id
    });
  });
};
