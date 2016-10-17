"use strict";

var express = require("express");
var router = express.Router();
var Course = require("../models/course-model");
var Review = require("../models/review-model");
var User = require("../models/user-model");
var validationErrors = require("./validationErrors");
var authorization = require("../middleware/authorization");

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
	Course.findById(req.params.id)
	.populate('reviews')
	.exec(function(err, result) {
		if (err) return next(err);
		if (!result) {
			err = new Error("Course not found");
			err.status = 404;
			return next(err);
		}
		console.log(result);

		var body = {};
		body.data = [];
		body.data.push(result);
		res.json(body);
	});
});

// Creates a course, sets the Location header, and returns no content.
router.post("/", authorization, function(req, res, next) {
	
	var course = new Course(req.body);
	
	course.save( function (err) {

		if (err) return validationErrors(err, res);
		
		res.status(201);
		res.location("/courses/" + course._id);
		res.end();
	});
});

// Updates a course and returns no content
router.put("/:id", authorization, function(req, res, next) {
	
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
		
		for (var i = 0; i < req.body.steps.length; i++) {
			req.body.steps[i].stepNumber = i + 1;
		}
		
		req.course.update(req.body, {runValidators: true}, function (err, course) {
		
			if (err) return validationErrors(err, res);
			
			res.status(204);
			res.end();
		});
	});	
});

// Creates a review for the specified course ID, sets the Location header to the related course, and returns no content.
router.post("/:courseId/reviews", authorization, function(req, res, next) {
	
		
	Course.findOne({_id: req.params.courseId}, 'reviews', function (err, course) {
		
		if (err) return next(err);

		var review = new Review(req.body);
		course.reviews.push(review);
		
		course.save( function (err) {
			if (err) return next(err);
		});
		
		review.save( function (err) {

			if (err) return validationErrors(err, res);
			
			res.status(201);
			res.location("/courses/" + course._id);
			res.end();
		});
	});
});

// Deletes the specified review and returns no content.
router.delete("/:courseId/reviews/:id", authorization, function(req, res, next) {

	console.log('Reached delete route');
	
	var review = Review.findOne({_id: req.params.id}, function (err, reviewId) {
		
		console.log(reviewId);
		console.log('Test err = ' + err);
		
		if (err) return next(err);
	}).then(
		Course.findOne({_id: req.params.courseId}, 'reviews', function (err, course) {
			
			if (err) return next(err);
			console.log(course.reviews);
			
			course.reviews.splice(course.reviews.indexOf(req.params.id), 1);
			
			console.log(course.reviews);
			
			course.save( function (err) {
				if (err) return next(err);
			});
			
			res.status(204);
			res.end();
		})
	);
});


module.exports = router;