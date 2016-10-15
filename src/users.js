"use strict";

var express = require("express");
var router = express.Router();
var Course = require("./course-model");
var Review = require("./review-model");
var User = require("./user-model");

// Returns the currently authenticated user.
router.get("/", function(req, res) {
	res.json({response: "You sent me a users GET request."});
});

// Creates a user, sets the Location header to "/" and returns no content.
router.post("/", function(req, res, next) {
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

		// if error save in following JSON format for angular app.
		// { "message": "Validation Failed", "errors": { "property": [ { "code": "", "message": "" }, ... ] } } 
		if (err) {
			if (err.name === "ValidationError") {
				
				var validation = {
					message: "Validation Failed",
					errors: {}
				};
			  
				for (var i in err.errors) {
					validation.errors[i] = [{
						code: 400,
						message: err.errors[i].message
					}];
				}
				console.log(validation);
				return res.status(400).json(validation);
			} else {
				return next(err);
			}
		}
		
		res.end();
	});
});


module.exports = router;