'use strict';

/*********************************/
/** Load modules
/*********************************/
var express = require('express');
var createError = require('http-errors');	
var jsonParser = require("body-parser").json;	
var morgan = require('morgan');					// for logging http activity to console
var mongoose = require("mongoose");				// data base 
var seeder = require('mongoose-seeder');		// for loading database at startup
var seedData = require('./data/data.json');		// database initialization data

// routes
var courses = require("./routes/courses");
var users = require("./routes/users");

var app = express();

/*********************************/
/** Connect to database
/*********************************/
// mongoose models
require("./models/course-model");
require("./models/review-model");
require("./models/user-model");

// sets up a database connection
mongoose.connect("mongodb://localhost:27017/db");

var db = mongoose.connection;

// write a message to console on error
db.on("error", function(err) {
	console.error("db connection error", err);
});

// seed the data base
db.once("open", function() {
	seeder.seed(seedData)
	.catch(function (err) {
		if (err) {
			console.log(err);
		}
	});
	
	// write a message indication connection made.
	console.log("db connection successful");
});

/*********************************/
/** Routing
/*********************************/
// morgan gives us http request logging
app.use(morgan('dev'));
app.use(jsonParser());


// setup our static route to serve files from the "public" folder
app.use('/', express.static('public'));
app.use('/api/courses', courses);
app.use('/api/users', users);

/*********************************/
/** Error handling
/*********************************/
// catch 404 
app.use(function (req, res, next) {
	next(createError(404, "Not found"));
});

// Global error handler. 
app.use(function (err, req, res, next) {
	res.status(err.status || 500);
	res.json({
		error: {
			message: err.message
		}
	});
});

/*********************************/
/** Server
/*********************************/
// set our port
app.set('port', process.env.PORT || 5000);

// start listening on our port
var server = app.listen(app.get('port'), function() {
	console.log('Express server is listening on port ' + server.address().port);  
});
