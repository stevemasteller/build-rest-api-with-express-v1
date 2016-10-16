"use strict";

var express = require("express");
var router = express.Router();
var Course = require("../models/course-model");
var Review = require("../models/review-model");
var User = require("../models/user-model");
var validationErrors = require("./validationErrors");
var authorization = require("../middleware/authorization");

// Returns the currently authenticated user.
router.get("/", authorization, function(req, res) {
	
	var body = {};
	body.data = [];
	body.data.push(req.course);
	
	res.json(body);
});

// Creates a user, sets the Location header to "/" and returns no content.
router.post("/", authorization, function(req, res, next) {
	var registerUser = new User();
	
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
	
	registerUser.save( function (err) {
		
		if (err) return validationErrors(err, res);
		
		res.status(201);
		res.location('/');
		res.end();
	});
});


module.exports = router;