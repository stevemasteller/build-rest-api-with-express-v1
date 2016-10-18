"use strict";

var mongoose = require("mongoose");
var Course = require("./course-model");
var User = require("./user-model");

/**
 *
*/ 
var Schema = mongoose.Schema;
/**
 *
*/ 
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

ReviewSchema.pre('save', function(next) {
	var review = this;
	review.rating = Math.round(review.rating);
	next();
});

ReviewSchema.pre('save', function(next) {
//	console.log('this = ' + this);
	console.log('this.user = ' + this.user);
	console.log('this._id = ' + this._id);
	var user = this.user;
	var id = this._id;
	
	Course.find({'reviews': this._id}, 'reviews', {'user': this.user})
	.populate('reviews').populate('users')
	.exec( function (err, results) {
		
		if (err) return next(err);
		
		var userReviews = JSON.stringify(results);
		var emptyArray = [];
		
		console.log('review users = ' + userReviews);
		if (userReviews !== '[]') {
			var err = new Error;
			var errors = [{
				"message": "A user can only have one revew per course."
			}];
			err.name = "ValidationError";
			err.errors = errors;
			console.log('error = ' + err);
			next(err);
		}
		next();
	});
});

var Review = mongoose.model('Review', ReviewSchema);

module.exports = Review;

