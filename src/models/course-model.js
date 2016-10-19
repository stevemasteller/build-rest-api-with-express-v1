"use strict";

/************************************************************/
/** Mongoose Course model
/************************************************************/
var mongoose = require("mongoose");

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


/************************************************************/
/** overallRating implemented as a virtual to ensure that it
/** does not get out of sync with the review ratings.
/************************************************************/
CourseSchema.virtual('overallRating').get(function() {
	var sum = 0;
	var avg = 0;
	
	// don't do calculation if review does not exist
	if (this.reviews) {
		for (var i = 0; i < this.reviews.length; i++) {
			sum += this.reviews[i].rating;
		}
		avg = Math.round( sum / this.reviews.length);
	}

	return avg;
});


/************************************************************/
/** Export model
/************************************************************/
// include virtuals in JSON output
CourseSchema.set('toJSON', { virtuals: true }); 

var Course = mongoose.model('Course', CourseSchema);

module.exports = Course;

