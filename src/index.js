'use strict';

// load modules
var express = require('express');
var jsonParser = require("body-parser").json;
var morgan = require('morgan');
var seeder = require('mongoose-seeder');
var seedData = require('./data/data.json');

var courses = require("./routes/courses");
var users = require("./routes/users");

var app = express();

/*********************************/
/** Connect to database
/*********************************/
require("./models/course-model");
require("./models/review-model");
require("./models/user-model");

var mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/db");

var db = mongoose.connection;

db.on("error", function(err) {
	console.error("db connection error", err);
});

db.once("open", function() {
	seeder.seed(seedData)
	.catch(function (err) {
		if (err) {
			console.log(err);
		}
	});
	console.log("db connection successful");
});
/*********************************/

// morgan gives us http request logging
app.use(morgan('dev'));
app.use(jsonParser());


// setup our static route to serve files from the "public" folder
app.use('/', express.static('public'));
app.use('/api/courses', courses);
app.use('/api/users', users);

app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    error: {
      message: err.message
    }
  });
});

// set our port
app.set('port', process.env.PORT || 5000);

// start listening on our port
var server = app.listen(app.get('port'), function() {
  console.log('Express server is listening on port ' + server.address().port);  
});
