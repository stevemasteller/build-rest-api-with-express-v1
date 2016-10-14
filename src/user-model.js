"use strict";

var mongoose = require("mongoose");

/**
 *
*/ 
var Schema = mongoose.Schema;
/**
 *
*/ 
var UserSchema = new Schema ({
	fullName: String,
	emailAddress: String,
	hashedPassword: String
});

var User = mongoose.model('User', UserSchema);

module.exports = User;

