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
	title: {
		type: String,
		required: [true, "A course title is required."]
	},
	description: {
		type: String,
		required: [true, "A course description is required."]
	},
	estimatedTime: String,
	materialsNeeded: String,
	steps: {
		type: [{
			stepNumber: Number,
			title: {
				type: String,
				required: [true, "A step title is required."]
			},
			description: {
				type: String,
				required: [true, "A step description is required."]
			}
		}],
		required: [true, "At least one step is required."]
	},
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
	avg = Math.round( sum / this.reviews.length);
	return avg;
});

var Course = mongoose.model('Course', CourseSchema);

module.exports = Course;

