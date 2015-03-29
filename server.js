/**
 * Module dependencies
 **/
'use strict';
// Initialize the node modules
var express = require('express');
var connect = require('connect');
var app = module.exports = express();
var server = require('http').createServer(app);
var flash = require('connect-flash');
var io = require('socket.io').listen(server);
var AWS = require('aws-sdk');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var busboy = require('connect-busboy');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var port = parseInt(process.env.PORT, 10) || 3000;
var passport = require('passport');
var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');
var socketJwt = require('socketio-jwt');


/**
 * Get Database Connection to mongoDB
 * move DB config to configuration file
 */
var configDB = require(__dirname + '/server/config/database.js');
mongoose.connect(configDB.url);


/**
 *  Configuration
 *  Get AWS/S3Client - using kashcandi-account credentials saved on local file system
 */
var credentials = new AWS.SharedIniFileCredentials({profile: 'kashcandi-account'});
AWS.config.credentials = credentials;
var s3Client = new AWS.S3();
/**
 * App Port || 3000
 */
app.set('port', process.env.PORT || 3000);


app.use('/api', expressJwt({secret: 'secret'}));
app.use(connect.json());
app.use(connect.urlencoded());
app.use(express.static('app'));
app.use(cookieParser());
app.use(bodyParser());
app.use(busboy());
app.use(flash());
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  name: 'music-app',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.set('views', __dirname + '/app/views');
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

/**
 * Log each Request
 * Get an instance of the express Router
 */
var router = express.Router();
router.use(function (req, res, next) {
  console.log('Processing request...', req.body);
  next();
});


// Use router with /api prefix
app.use('/api', router);

// development only
if (app.get('env') === 'development') {
  app.use(connect.errorHandler({dumpExceptions: true, showStack: true}));
}

// production only
if (app.get('env') === 'production') {
}


require('./server/config/passport.js')(passport);

require('./server/routes/routes.js')(app);


// Configure Controllers
require('./server/routes/controllers/auth.js')(app, jwt);
require('./server/routes/controllers/user.js')(router, passport);
require('./server/routes/controllers/audio.js')(router);
require('./server/routes/controllers/upload.js')(router, s3Client);
require('./server/routes/controllers/playlist.js')(router);

require('./server/routes/controllers/session.js')(router, passport);


io.set('authorization', socketJwt.authorize({
  secret: 'secret',
  handshake: true
}));

io.sockets
  .on('connection', function (socket) {
    console.log(socket.handshake.decoded_token.username, 'connected');
    var loggedInUsers = [];
    var clients = io.sockets.clients();
    clients.forEach(function (socket) {
      loggedInUsers.push({
        user: {
          name: socket.handshake.decoded_token.first_name + ' ' + socket.handshake.decoded_token.last_name,
          id: socket.handshake.decoded_token.id
        }
      });
    });

    socket.emit('authenticated', {msg: loggedInUsers});

    socket.on('message', function (payload) {
      socket.broadcast.emit('new-message', {
        user: {
          name: socket.handshake.decoded_token.first_name + ' ' + socket.handshake.decoded_token.last_name,
          id: socket.handshake.decoded_token.id
        }, message: payload.message
      });
    });
  });

server.listen(3000, function () {
  console.log('listening on http://localhost:3000');
});


/*
 io.sockets.on('connection', function (socket) {

 connection.socketConnection(socket);

 /*

 });
 });
 */




// Start Node Server
server.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
