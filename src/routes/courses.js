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
		
		if (err) return next(err);
		
		if (!result) {
			err = new Error("Course not found");
			err.status = 404;
			return next(err);
		}
		
		var body = {};
		body.data = result;
		res.json(body);
	});
});

// Returns all course properties and related documents for the provided course ID.
router.get("/:id", function(req, res, next) {
	Course.findById(req.params.id)
	.populate('reviews').populate('user')
	.exec(function(err, result) {
		
		if (err) return next(err);
		
		if (!result) {
			err = new Error("Course not found");
			err.status = 404;
			return next(err);
		}

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
		
		if (!course) {
			err = new Error("Course not found");
			err.status = 404;
			return next(err);
		}

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
	
	var reviewOwner = '';
	var courseOwner = '';
	var user = '';
	
	var authorize = Review.findOne({_id: req.params.id})
		.populate('user')
		.exec( function (err, review) {
		
		if (err) {
			return next(err);
		} else {
		
			if (!review) {
				err = new Error("Review not found");
				err.status = 404;
				return next(err);
			} else {
			
				reviewOwner = review.user._id;
				console.log('review = ' + review);
	
				Course.findOne({_id: req.params.courseId})
				.exec( function(err, course) {
						
					if (err) return next(err);
					
					if (!course) {
						err = new Error("Course not found");
						err.status = 404;
						return next(err);
					} else {
					
			//			console.log('course = ' + course);
						courseOwner = course.user;
						user = req.user._id;
						
						console.log('reviewOwner = ' + reviewOwner);
						console.log('courseOwner = ' + courseOwner);
						console.log('user = ' + req.user._id)
						
			//			if (req.user._id !== )
						
						Review.findOne({_id: req.params.id})
						.remove()
						.exec( function (err) {
							if (err) return next(err);
						});
						
						res.status(204);
						res.end();
					}
				});
			}
		}
	});
});


module.exports = router;