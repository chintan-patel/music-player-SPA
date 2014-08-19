/**
*  * Module dependencies
**/
'use strict';
// Initialize the node modules
var express = require('express');
var connect = require('connect');
var app = module.exports = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var AWS = require('aws-sdk');
var mongoose   = require('mongoose');
var bodyParser= require('body-parser');
var port    = parseInt(process.env.PORT, 10) || 3000;

// Get DB connection
mongoose.connect('mongodb://accountUser:password@localhost:27017/test'); // connect to our database

/**
*  Configuration
*/
// Get AWS/S3Client
var credentials = new AWS.SharedIniFileCredentials({profile: 'kashcandi-root-account'});
AWS.config.credentials = credentials;
var s3Client = new AWS.S3();

// Set App Port
app.set('port', process.env.PORT || 3000);

app.use(connect.json());
app.use(connect.urlencoded());

var router = express.Router(); // get an instance of the express Router
// Log Request
router.use(function(req, res, next) {
    console.log('Processing request...', req.body);
    next();
});
// Use router with /api prefix
app.use('/api', router);

// development only
if (app.get('env') === 'development') {
  app.use(connect.errorHandler({ dumpExceptions: true, showStack: true }));
}

// production only
if (app.get('env') === 'production') {
}

require('./routes/Controllers/audio.js')(router); // configure Audio routes
require('./routes/Controllers/playlist.js')(router); // configure Audio routes


// Socket.io Communication
var connection = require('./routes/socket.js')
io.sockets.on('connection', function(socket){
    connection.socketConnection(socket,  s3Client);
});

// Start Node Server
server.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
