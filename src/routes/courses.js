"use strict";

var express = require("express");
var router = express.Router();
var Course = require("../models/course-model");
var Review = require("../models/review-model");
var User = require("../models/user-model");
var authorization = require("../middleware/authorization");

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
router.post("/", authorization, function(req, res, next) {
	
	var course = new Course(req.body);
	
	course.save( function (err) {

		error(err, res);
		res.status(201);
		res.location("/courses/" + course._id);
		res.end();
	});
});

// Updates a course and returns no content
router.put("/:id", authorization, function(req, res, next) {
	
	for (var i = 0; i < req.body.steps.length; i++) {
		req.body.steps[i].stepNumber = i + 1;
	}
	
	req.course.update(req.body, {runValidators: true}, function (err, course) {
	
		validationErrors(err, res, next);
		res.status(204);
		res.end();
	});
});

// Creates a review for the specified course ID, sets the Location header to the related course, and returns no content.
router.post("/:courseId/reviews", authorization, function(req, res) {
	res.json({
		response: "You sent me a POST request with courseID:" + req.params.courseId,
		body: req.body
	});
});

// Deletes the specified review and returns no content.
router.delete("/:courseId/reviews/:id", authorization, function(req, res) {
	res.json({
		response: "You sent me a DELETE request with courseID:" + req.params.courseId + " and review ID:" + req.params.id,
		body: req.body
	});
});


module.exports = router;