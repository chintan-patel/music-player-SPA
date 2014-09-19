module.exports.socketConnection =  function(socket, s3Client)
{
  socket.emit('user:connected', {
    user : {
	_id : socket.id,
	username: 'chintan-'+socket.id,
	created_on :  new Date().toTimeString()
    }
  });

  // notify other clients that a new user has joined
  socket.broadcast.emit('user:join', {
    username : socket.id,
    created_on :  new Date().toDateString()
  });
  
  socket.on('audio.set',function(data){
    socket.broadcast.emit('audio.set',data)
  });
  socket.on('audio.play',function(){
  });
  socket.on('audio.pause',function(){
  });

  // broadcast a user's message to other users
  socket.on('song:add', function (data) {
    socket.broadcast.emit('song:add', data);
  });

  // clean up when a user leaves, and broadcast it to other users
  socket.on('user:disconnected', function () {
    socket.broadcast.emit('user:left', {
      'username' : socket.id
      });
  });
}
