"use strict";

/************************************************************/
/** Mongoose User model
/************************************************************/
var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");		// for hashing password

var Schema = mongoose.Schema;
var UserSchema = new Schema ({
	fullName: {
		type: String,
		required: [true, "A full name is required."]
	},
	emailAddress: {
		type: String,
		required: [true, "An email address is required."],
		validate: {
			
			// verify emailAddress is in a valid email format
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
		
		// Fires if both password and confirm password absent
		required: [true, "A password is required."],
		validate: {
			validator: function() {
				
				// Password and comfirm password must match.
				// Fires if only confirmPassword is absent.
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


/************************************************************/
/** Temporary password used for verification and to calculate
/** hashedPassword
/************************************************************/
UserSchema.virtual('password').get( function () {
	return this._password;
});

UserSchema.virtual('password').set( function (password) {
	this._password = password;
	var salt = bcrypt.genSaltSync(10);			// generate salt 10 rounds
	var hash = bcrypt.hashSync(password, salt);	// hash password
	this.hashedPassword = hash; 
}); 


/************************************************************/
/** Temporary confirmPassword used for verification.
/************************************************************/
UserSchema.virtual('confirmPassword').get( function () {
	return this._confirmPassword;
});

UserSchema.virtual('confirmPassword').set( function (confirmPassword) {
	this._confirmPassword = confirmPassword;
});


/************************************************************/
/** Additional verification because only one custom validator 
/** may be defined in model.
/************************************************************/
// Unique emailAddress
UserSchema.path('emailAddress').validate(function (v, callback) {

	// test for unique emailAddress
	this.model('User').findOne({ emailAddress: v}, function (err, user) {
		if (err) return callback(err);
		callback(!user);
	});
}, "A unique email address is required.");

// minimum password strength
UserSchema.path('hashedPassword').validate(function (v, callback) {
	
	// password strength test requires minimum 8 characters.
	// simple test used for develepment allowing seeds to use
	// password = "password".
	//
	// For strong password. Comment weak regEx and message uncomment
	// strong regEx and message.
	var regEx = new RegExp("^(?=.{8,})");
	// var regEx = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
	
	// test password strength
	var isNotError = regEx.test(this._password);
	
	return isNotError;
	
}, "The password must contain at least 8 characters.");
//}, "The password must contain at least 8 characters, 1 lower case alphabetic character, 1 upper case alphabetic character, 1 numeric character, and 1 special character."

/************************************************************/
/** Export model
/************************************************************/
var User = mongoose.model('User', UserSchema);

module.exports = User;

