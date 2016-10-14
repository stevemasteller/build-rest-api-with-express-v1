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
	rating: Number,
	review: String
});


var Review = mongoose.model('Review', ReviewSchema);

module.exports = Review;

