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
	postedOn: Date,
	rating: {
		type: Number,
		required: [true, "A rating is required."],
		min: [1, 'The minimum rating is 1'],
		max: [5, 'The maximum rating is 5'],
		validate: {
			validator: function(v) {
				var nearest = Math.ceil(v);
				if (v === nearest) {
					return true;
				} else {
					return false;
				}
			},
			message: "The rating must be a whole number."
		}
	},
	review: String
});


var Review = mongoose.model('Review', ReviewSchema);

module.exports = Review;

