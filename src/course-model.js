"use strict";

var mongoose = require("mongoose");

/**
 *
*/ 
var Schema = mongoose.Schema;
var CourseSchema = new Schema ({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	title: String,
	description: String,
	estimatedTime: String,
	materialsNeeded: String,
	steps: 
		[{
			stepNumber: Number,
			title: String,
			description: String
		}],
	reviews:
		[{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Review'
		}]
});
	
CourseSchema.virtual('overallRating').get(function() {
	var sum = 0;
	var avg = 0;
	for (var i = 0; i < this.reviews.lenghth; i++) {
		sum += this.reviews[i].rating;
	}
	if (this.reviews.length === 0) {
		avg = 0;
	} else {
		avg = Math.round( sum / this.reviews.length);
	}
	return avg;
});

var Course = mongoose.model('Course', CourseSchema);

module.exports = Course;

