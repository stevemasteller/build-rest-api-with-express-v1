"use strict";

/************************************************************/
/** Mongoose Review model
/************************************************************/
var mongoose = require("mongoose");
var Course = require("./course-model"); // used for verification
var User = require("./user-model");		// used for verification

var Schema = mongoose.Schema;
var ReviewSchema = new Schema ({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	postedOn: {
		type: Date,
		default: Date.now
	},
	rating: {
		type: Number,
		required: [true, "A rating is required."],
		min: [1, 'The minimum rating is 1'],
		max: [5, 'The maximum rating is 5'],
	},
	review: String
});

/************************************************************/
/** Pre-Save used to modify inputs before storage
/************************************************************/
// round review.rating to a whole number
ReviewSchema.pre('save', function(next) {
	var review = this;
	review.rating = Math.round(review.rating);
	next();
});

/************************************************************/
/** Pre-Save used for verification, this allows a complete
/** document including the data to be saved to be examined.
/************************************************************/
// verify that a user can only save one review per course
ReviewSchema.pre('save', function(next) {
	var user = this.user;	// current user id
	var id = this._id;		// current review id
	
	// Find the course containing the review with this._id
	//    filter this to contain only reviews.
	//	  filter those reviews by this.user
	Course.find({'reviews': this._id}, 'reviews', {'user': this.user})
	.populate('reviews').populate('users')
	.exec( function (err, results) {
		
		if (err) return next(err);
		
		// convert to a json for searching
		var userReviews = JSON.stringify(results);
		
		// Check to see if user id is in userReviews
		if (userReviews.indexOf(user) !== -1 ) {
			
			// create and format an error
			var err = new Error;
			var errors = [{
				"message": "A user can only have one review per course."
			}];
			err.name = "ValidationError";
			err.errors = errors;

			// verification failed
			next(err);
			
		} else {
			// verification passed
			next();
		}
	});
});

// verify that a user is not reviewing their own course.
ReviewSchema.pre('save', function(next) {
	var user = this.user;
	var id = this._id;
	
	// Find the course containing the review with this._id
	//	filter by the owner of this course
	Course.find({'reviews': this._id}, 'user')
	.populate('reviews').populate('users')
	.exec( function (err, results) {
		
		if (err) return next(err);
		
		// convert to a json for searching
		var courseOwner = JSON.stringify(results);
		
		// Check to see if user id matches the owner of this course
		if (courseOwner.indexOf(user) !== -1 ) {
			
			// create and format an error			
			var err = new Error;
			var errors = [{
				"message": "A user can not review their own course."
			}];
			err.name = "ValidationError";
			err.errors = errors;

			// verification failed
			next(err);	
			
		} else { 
			// verification passed
			next();
		}
	});
});

/************************************************************/
/** Export model
/************************************************************/
var Review = mongoose.model('Review', ReviewSchema);

module.exports = Review;

