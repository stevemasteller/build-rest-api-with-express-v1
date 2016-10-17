"use strict";

var mongoose = require("mongoose");

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
	var course = this;
	course.rating = Math.round(course.rating);
	next();
});

var Review = mongoose.model('Review', ReviewSchema);

module.exports = Review;

