var mongoose = require('mongoose');

// mongoose.connect('mongodb://localhost/test');
mongoose.connect('mongodb://root:root@ds135963.mlab.com:35963/heroku_cw3l47b5');

var db = mongoose.connection;

db.on('error', function() {
  console.log('mongoose connection error');
});

db.once('open', function() {
  console.log('mongoose connected successfully');
});

module.exports = db;