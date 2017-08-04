//middleware
// var express = require('express'),
//   app = express(),
//   server = require('http').createServer(app),
//   io = require('socket.io').listen(server);

// server.listen(process.env.PORT || 3000);

var express = require('express');
var app = express();
const server = app.listen(process.env.PORT || 3000, () => console.log(`Listening on 3000`));

const io = require('socket.io').listen(server);

var db = require('../database-mongo/index');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var morgan = require('morgan');
var expressValidator = require('express-validator');
var session = require('express-session');

// Socket
// var http = require('http').Server(app);
// var io = require('socket.io')(http);

// var socket = require('./sockets.js')(io);

//Models
var Meeting = require('../database-mongo/models/meeting.js');
var Match = require('../database-mongo/models/match.js');

//APIs
const gmaps = require('./google-maps.js');
const yelp = require('./yelp.js');


  io.on('connection', function (socket) {
    console.log('a user connected');

    socket.on('user looking for friend', function (meeting) {
      // Room set-up (rooms are naively set as sorted and joined names e.g. 'alicebob')
      var sortedPair = [meeting.friendId, meeting.userId].sort();
      var room = sortedPair.join('');

      socket.join(room, function() {
        console.log('room', room);
        socket.emit('match status', 'Looking for your friend...');
        socket.to(room).emit('match status', 'Looking for your friend...');

        Meeting.findOne({userId: meeting.friendId, friendId: meeting.userId})
          .exec(function (err, doc) {
            if (err) return console.error('Err querying Meeting table for userId and friendId: ', err);
            if (doc) {
              // Match found! Insert match into the db.
              // socket.broadcast.emit('match status', 'found');
              console.log('Found a match');
              console.log('socket.rooms', socket.rooms);
              socket.emit('match status', 'Your match was found!');
              socket.to(room).emit('match status', 'Your match was found!');

              var newMatch = new Match({
                userId1: meeting.userId,
                userId2: meeting.friendId,
                matchFulfilled: true
              });

              // Get location 1
              var friendLocation = doc.userLocation;

              // Get location 2
              // - Pull the friend's geocoded location from db
              Meeting.findOne({userId: meeting.userId})
                .exec(function (err, doc) {
                  var userLocation = doc.userLocation;

                  gmaps.generateMidpoint(userLocation.coordinates, friendLocation.coordinates)
                    .then((midpoint) => {
                      console.log('Midpoint generated:', midpoint);

                      yelp.yelpRequest(midpoint)
                        .then((yelpLocations) => {
                          // Re-render client

                          // push to the beginning of yelpLocations
                          // var md = { coordinates: midpoint };
                          // yelpLocations.unshift(md);
                          io.sockets.emit('midpoint', { lat: midpoint.latitude, lng: midpoint.longitude });
                          io.sockets.emit('meeting locations', yelpLocations);
                          io.sockets.emit('user locations', {
                            location1: { lat: userLocation.coordinates[0], lng: userLocation.coordinates[1] },
                            location2: { lat: friendLocation.coordinates[0], lng: friendLocation.coordinates[1] }
                          })
                        });
                    });
                });

            } else {
              console.log(`User ${meeting.friendId} and Friend ${meeting.userId} match not found in db.`);
              // TODO somehow print "Looking for your friend"
              console.log('room', room);
              socket.to(room).emit('match status', 'Looking for your friend.');
            }
          }); // End meeting.findOne
      }); // End socket.join room
    }); // End socket on

    socket.on('disconnect', function () {
      // TODO update socket_id db
      console.log('a user disconnected');
    });
  });




//Routes
var users = require('./users.js');
var routes = require('./routes.js')(io);

//Middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('combined'));

// Express Validator (displays errors when logging in)
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
    var namespace = param.split('.'), root = namespace.shift(), formParam = root;

    while (namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param: formParam,
      msg: msg,
      value: value
    };
  }
}));

app.use('/', routes);
app.use('/users', users);
app.use(express.static(__dirname + '/../react-client/dist'));

// const PORT = process.env.PORT || 8080;
// const server = http.createServer(handleRequest);
// server.listen(PORT, () => {
//   console.log('Server listening on: http://localhost:%s', PORT);
// });



// http.listen(process.env.PORT || 3000, function(){
//   console.log('socket listening on *:3000');
// });