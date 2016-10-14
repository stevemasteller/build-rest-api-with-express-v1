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
router.post("/", function(req, res) {
	res.json({
		response: "You sent me a users POST request.",
		body: req.body
	});
});


module.exports = router;