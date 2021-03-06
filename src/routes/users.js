"use strict";

/************************************************************/
/** /api/users routes
/************************************************************/
var express = require("express");
var createError = require('http-errors');
var router = express.Router();

// mongoose models
var Course = require("../models/course-model");
var Review = require("../models/review-model");
var User = require("../models/user-model");

var validationErrors = require("./validationErrors");
var authorization = require("../middleware/authorization");


/************************************************************/
/** unused routes
/************************************************************/
router.put("/", function(req, res, next) {
	
	next(createError(403, "Cannot edit a collection of users."));
});

router.delete("/", function(req, res, next) {
	
	next(createError(403, "Cannot delete a collection of users."));
});


/************************************************************/
/** /api/users
/************************************************************/
// Returns the currently authenticated user.
router.get("/", authorization, function(req, res, next) {
	
	// create a new user
	var user = {};
	
	// format for output
	user.data = [];
	user.data.push(req.user);
	
	//output response
	res.json(user);
});

// Creates a user, sets the Location header to "/" and returns no content.
router.post("/", function(req, res, next) {
	
	// create a new user
	var registerUser = new User();
	
	// avoid assigning undefined values
	if (req.body.fullName) {
		registerUser.fullName = req.body.fullName;
	}
	
	if (req.body.emailAddress) {
		registerUser.emailAddress = req.body.emailAddress;
	}
	
	if (req.body.password) {
		registerUser.password = req.body.password;
	}
	
	if (req.body.confirmPassword) {
		registerUser.confirmPassword = req.body.confirmPassword;
	}
	
	// save the new user
	registerUser.save( function (err) {
		
		// check for validation errors
		if (err) return validationErrors(err, res, next);
		
		// change location to '/' and output response
		res.status(201);
		res.location('/');
		res.end();
	});
});


/************************************************************/
/** Export routes
/************************************************************/
module.exports = router;