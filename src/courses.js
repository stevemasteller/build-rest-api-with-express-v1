"use strict";

var express = require("express");
var router = express.Router();
var Course = require("./course-model");
var Review = require("./review-model");
var User = require("./user-model");

router.param("id", function(req, res, next, id) {
	Course.findById(req.params.id)
		.populate('reviews')
		.exec(function(err, result) {
			if (err) return next(err);
			if (!result) {
				err = new Error("Course not found");
				err.status = 404;
				return next(err);
			}
		req.course = result;
		return next();
	});
});

// Returns the Course "_id" and "title" properties
router.get("/", function(req, res, next) {
	
/*	var body = {
		"data" : 
			[
				{
					"_id": "1",
					"title": "test1"
				},
				{
					"_id": "2",
					"title": "test2"
				}
			]
	};
	res.json(body);
*/

	Course.find({}, '_id title', function (err, result) {
			if (err) return next (err);
			var body = {};
			body.data = result;
			res.json(body);
	});
});

// Returns all course properties and related documents for the provided course ID.
router.get("/:id", function(req, res, next) {
	var body = {};
	body.data = [];
	body.data.push(req.course);
	res.json(body);
});

// Creates a course, sets the Location header, and returns no content.
router.post("/", function(req, res) {
	res.json({
		response: "You sent me a POST request.",
		body: req.body
	});
});

// Updates a course and returns no content
router.put("/:id", function(req, res) {
	res.json({
		response: "You sent me a PUT request with ID" + req.params.id,
		body: req.body
	});
});

// Creates a review for the specified course ID, sets the Location header to the related course, and returns no content.
router.post("/:courseId/reviews", function(req, res) {
	res.json({
		response: "You sent me a POST request with courseID:" + req.params.courseId,
		body: req.body
	});
});

// Deletes the specified review and returns no content.
router.delete("/:courseId/reviews/:id", function(req, res) {
	res.json({
		response: "You sent me a DELETE request with courseID:" + req.params.courseId + " and review ID:" + req.params.id,
		body: req.body
	});
});


module.exports = router;