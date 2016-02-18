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
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var busboy = require('connect-busboy');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var port = process.env.PORT || 3000;
var passport = require('passport');
var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');
var socketJwt = require('socketio-jwt');


/**
 * Get Database Connection to mongoDB
 * move DB config to configuration file
 */
var configDB = require(__dirname + '/config/database.js');
mongoose.connect(configDB.url);

if(!mongoose.connection) {
	console.log('MongoDB connection failed');
	process.exit(1);
}


/**
 * App Port || 3000
 */
app.set('port', process.env.PORT || 3000);


//app.use('/api', expressJwt({secret: 'secret'}));
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
app.use(express.static('/bower_components', __dirname + 'bower_components'));

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

require('./config/passport.js')(passport);
app.get('/', function (req, res) {
    res.render(__dirname + '/app/index.html');
  });


// Configure Controllers
require('./resources/user/auth')(router, jwt);
require('./resources/user/user.controller')(router);
require('./resources/audio/audio.controller')(router);
require('./resources/upload')(router);
require('./resources/playlist/playlist.controller')(router);
require('./resources/user/session')(router);


server.listen(3000, function () {
  console.log('Express server listening on port : http://localhost:' + app.get('port'));
});
