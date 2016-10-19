"use strict";

/************************************************************/
/** /api/courses routes
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
	
	next(createError(403, "Cannot edit a collection of courses."));
});

router.delete("/", function(req, res, next) {
	
	next(createError(403, "Cannot delete a collection of courses."));
});

router.post("/:id", function(req, res, next) {
	
	next(createError(405, "Use the '/api/courses' route to create a course."));
});

router.delete("/:id", function(req, res, next) {
	
	next(createError(403, "Cannot delete a course."));
});

router.put("/:courseId/reviews", function(req, res, next) {
	
	next(createError(403, "Cannot edit a collection of reviews."));
});

router.delete("/:courseId/reviews", function(req, res, next) {
	
	next(createError(403, "Cannot delete a collection of reviews."));
});

router.get("/:courseId/reviews/:id", function(req, res, next) {
	
	next(createError(403, "Cannot get a single review. Use the '/api/courses/:id' route instead to get the reviews for a specific course."));
});

router.post("/:courseId/reviews/:id", function(req, res, next) {
	
	next(createError(405, "Use the '/api/courses/:courseId/reviews' route to create a review."));
});

router.put("/:courseId/reviews/:id", function(req, res, next) {
	
	next(createError(403, "Cannot edit a review."));
});

/************************************************************/
/** /api/courses
/************************************************************/
// Returns the Course "_id" and "title" properties
router.get("/", function(req, res, next) {
	
// Format used for output data. 
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
		
			// format data for output
			var body = {};
			body.data = courses;
			res.json(body);
		}
	});
});

// Creates a course, sets the Location header, and returns no content. Requires an authorized user.
router.post("/", authorization, function(req, res, next) {
	
	// create a new course
	var course = new Course(req.body);
	
	// save the new course
	course.save( function (err) {

		if (err) return validationErrors(err, res, next);
		
		// set location to new course and output response
		res.status(201);
		res.location("/courses/" + course._id);
		res.end();
	});
});


/************************************************************/
/** /api/courses/:id
/************************************************************/
// Returns all course properties and related documents for the provided course ID.
router.get("/:id", function(req, res, next) {
	
	// find a particular course and populate all the data
	Course.findById(req.params.id)
	.populate('reviews').populate('user')
	.exec(function(err, course) {
		
		if (err) return next(err);
		
		if (!course) {
			return next(createError(404, "Course not found"));
		} else {

			// format data for output
			var body = {};
			body.data = [];
			body.data.push(course);
			res.json(body);
		}
	});
});

// Updates a course and returns no content. Will only work
// if authorized user is course owner.
router.put("/:id", authorization, function(req, res, next) {
	
	// find a course and populate the reviews 
	Course.findById(req.params.id)
	.populate('reviews')
	.exec(function(err, course) {
		
		if (err) return next(err);
		
		if (!course) {
			return next(createError(404, "Course not found"));
		} else {
		
			// get authorized user and course owner
			var user = req.user._id.toJSON();
			var courseOwner = course.user.toJSON();
					
			// verify authorised user is course owner
			var authorized = (user === courseOwner);
			
			if (!authorized) {
				
				// not authorized
				return next(createError(401, "Not authorized"));
			} else {
						
				// update course
				req.course = course;
				req.course.update(req.body, {runValidators: true}, function (err, course) {
				
					if (err) return validationErrors(err, res, next);
					
					// return response
					res.status(204);
					res.end();
				});
			}
		}
	});	
});


/************************************************************/
/** /api/courses/:courseId/reviews
/************************************************************/
// Creates a review for the specified course ID, sets the 
// Location header to the related course, and returns no content.
// user must be authorized to create a review.
router.post("/:courseId/reviews", authorization, function(req, res, next) {
	
	// find a particular course, return only the reviews
	Course.findOne({_id: req.params.courseId}, 'reviews', function (err, course) {
		
		if (err) return next(err);
		
		if (!course) {
			return next(createError(404, "Course not found"));
		} else {

			var review = new Review(req.body);
			review.user = req.user._id;
			
			// save new review id in course
			course.reviews.push(review);
			course.save( function (err) {

				if (err) return next(err);
			});
			
			// save review
			review.save( function (err) {

				if (err) return validationErrors(err, res, next);
				
				// set location to current course and send response.
				res.status(201);
				res.location("/courses/" + course._id);
				res.end();
			});
		}
	});
});


/************************************************************/
/** /api/courses/:courseId/reviews/:id
/************************************************************/
// Deletes the specified review and returns no content.
router.delete("/:courseId/reviews/:id", authorization, function(req, res, next) {
	
	// find the review to be deleted.
	Review.findOne({_id: req.params.id})
		.populate('user')
		.exec( function (err, review) {
		
		if (err) return next(err);
		
		if (!review) {
			return next(createError(404, "Review not found"));
		} else {
		
			// find the course containing the review to be deleted.
			Course.findOne({_id: req.params.courseId})
			.exec( function(err, course) {
					
				if (err) return next(err);
				
				if (!course) {
					return next(createError(404, "Course not found"));
				} else {
					
					// get the current authorized user
					var user = req.user._id.toJSON();
					// get the review owner from the review previously found
					var reviewOwner = review.user._id.toJSON();
					// get the course owner from the course previously found
					var courseOwner = course.user.toJSON();
					
					// verify that the authorized user is either the review or course owner
					var authorized = (user === reviewOwner) || (user === courseOwner);
					
					if (!authorized) {
						
						// not authorized
						return next(createError(401, "Not authorized"));
					} else {
					
						// everything good remove the review
						Review.findOne({_id: req.params.id})
						.remove()
						.exec( function (err) {
							
							if (err) return next(err);
						});
						
						// send response
						res.status(204);
						res.end();
					}
				}
			});
		}
	});
});


/************************************************************/
/** Export routes
/************************************************************/
module.exports = router;