module.exports.socketConnection =  function(socket, s3Client)
{
  var listObjects = [];
  var params = {
    Bucket: 'dev.kashcandi.com', // required
    EncodingType: 'url',
    Prefix: 'user/1/music/1/'
  };

  s3Client.listObjects(params,function(err, data){
    if (err)
    {
      console.log(err, err.stack);
    }
    else
    {
      listObjects.push(data.Contents);
      console.log(data.Contents);
    }
  });
  
 var 	signedUrl = 'https://s3.amazonaws.com/dev.kashcandi.com/user/1/music/1/43c2c76a-ad09-4c77-9f3a-72b64c7f12cc';
  socket.emit('user:connected', {
    song: {
      "title": "This is a sample of music",
      "artist": {"name": "Chintan Patel"},
      "image": "images/1920x1080_75.jpeg",
      "file": signedUrl
    },
    user : {
	_id : socket.id,
	username: 'chintan-'+socket.id,
	created_on :  new Date().toTimeString()
    },
    listObjects: listObjects
    
  });

  // notify other clients that a new user has joined
  socket.broadcast.emit('user:join', {
    username : socket.id,
    created_on :  new Date().toDateString() + " " + new Date().toTimeString()
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
