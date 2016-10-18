"use strict";

var express = require("express");
var createError = require('http-errors');
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

	Course.find({}, '_id title', function (err, courses) {
		
		if (err) return next(err);
		
		if (!courses) {
			return next(createError(404, "Courses not found"));
		} else {
		
			var body = {};
			body.data = courses;
			res.json(body);
		}
	});
});

// Returns all course properties and related documents for the provided course ID.
router.get("/:id", function(req, res, next) {
	Course.findById(req.params.id)
	.populate('reviews').populate('user')
	.exec(function(err, course) {
		
		if (err) return next(err);
		
		if (!course) {
			return next(createError(404, "Course not found"));
		} else {

			var body = {};
			body.data = [];
			body.data.push(course);
			res.json(body);
		}
	});
});

// Creates a course, sets the Location header, and returns no content.
router.post("/", authorization, function(req, res, next) {
	
	var course = new Course(req.body);
	
	course.save( function (err) {

		if (err) return validationErrors(err, res, next);
		
		res.status(201);
		res.location("/courses/" + course._id);
		res.end();
	});
});

// Updates a course and returns no content
router.put("/:id", authorization, function(req, res, next) {
	
	Course.findById(req.params.id)
	.populate('reviews')
	.exec(function(err, course) {
		
		if (err) return next(err);
		
		if (!course) {
			return next(createError(404, "Course not found"));
		} else {
		
			var user = req.user._id.toJSON();
			var courseOwner = course.user.toJSON();
					
			var authorized = (user === courseOwner);
					
			if (!authorized) {
				return next(createError(401, "Not authorized"));
			} else {
						
				req.course = course;
							
				req.course.update(req.body, {runValidators: true}, function (err, course) {
				
					if (err) return validationErrors(err, res, next);
					
					res.status(204);
					res.end();
				});
			}
		}
	});	
});

// Creates a review for the specified course ID, sets the Location header to the related course, and returns no content.
router.post("/:courseId/reviews", authorization, function(req, res, next) {
	
		
	Course.findOne({_id: req.params.courseId}, 'reviews', function (err, course) {
		
		if (err) return next(err);
		
		if (!course) {
			return next(createError(404, "Course not found"));
		} else {

			var review = new Review(req.body);
			review.user = req.user._id;
			
			course.reviews.push(review);
			
			course.save( function (err) {

				if (err) return next(err);
			});
			
			review.save( function (err) {

				if (err) return validationErrors(err, res, next);
				
				res.status(201);
				res.location("/courses/" + course._id);
				res.end();
			});
		}
	});
});

// Deletes the specified review and returns no content.
router.delete("/:courseId/reviews/:id", authorization, function(req, res, next) {
	
	Review.findOne({_id: req.params.id})
		.populate('user')
		.exec( function (err, review) {
		
		if (err) return next(err);
		
		if (!review) {
			return next(createError(404, "Review not found"));
		} else {
		
			Course.findOne({_id: req.params.courseId})
			.exec( function(err, course) {
					
				if (err) return next(err);
				
				if (!course) {
					return next(createError(404, "Course not found"));
				} else {
					
					var user = req.user._id.toJSON();
					var reviewOwner = review.user._id.toJSON();
					var courseOwner = course.user.toJSON();
					
					var authorized = (user === reviewOwner) || (user === courseOwner);
					
					if (!authorized) {
						
						return next(createError(401, "Not authorized"));
					} else {
					
						Review.findOne({_id: req.params.id})
						.remove()
						.exec( function (err) {
							if (err) return next(err);
						});
						
						res.status(204);
						res.end();
					}
				}
			});
		}
	});
});


module.exports = router;