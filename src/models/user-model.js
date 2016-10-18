"use strict";

var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");

/**
 *
*/ 
var Schema = mongoose.Schema;
/**
 *
*/ 
var UserSchema = new Schema ({
	fullName: {
		type: String,
		required: [true, "A full name is required."]
	},
	emailAddress: {
		type: String,
		required: [true, "An email address is required."],
		validate: {
			validator: function(v) {
				
				// Regex test from http://emailregex.com/
				var emailTest = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
				
				var isNotError = emailTest.test(v); // perform the test
					
				return isNotError;
			},
			message: "A valid email address is required."
		}
	},
	hashedPassword: {
		type: String,
		required: [true, "A password is required."],
		validate: {
			validator: function() {
				
				if (this._confirmPassword === this._password) {
					return true;
				} else {
					return false;
				}
			},
			message: "The confirmation password and password must match."
		}
	}
});

UserSchema.virtual('password').get( function () {
	return this._password;
});

UserSchema.virtual('password').set( function (password) {
	this._password = password;
	var salt = bcrypt.genSaltSync(10);
	var hash = bcrypt.hashSync(password, salt);
	this.hashedPassword = hash; 
}); 

UserSchema.virtual('confirmPassword').get( function () {
	return this._confirmPassword;
});

UserSchema.virtual('confirmPassword').set( function (confirmPassword) {
	this._confirmPassword = confirmPassword;
});

// Can only have one custom validator inside the Schema.
UserSchema.path('emailAddress').validate(function (v, callback) {

	this.model('User').findOne({ emailAddress: v}, function (err, user) {
		if (err) return callback(err);
		callback(!user);
	});
}, "A unique email address is required.");

UserSchema.path('hashedPassword').validate(function (v, callback) {
	
	var regEx = new RegExp("^(?=.{8,})");
	
	var isNotError = regEx.test(this._password);
	
	return isNotError;
	
}, "The password must contain at least 8 characters.");


var User = mongoose.model('User', UserSchema);

module.exports = User;

