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
					
				if (isNotError) {
					return true;
				} else {
					return false;
				}
			},
			message: 'A valid email is required.'
		}, 
		validate: { 
			validator: function (v, callback) {
				this.model('User').count({ emailAddress: v}, function (err, count) {
					if (err) return callback(err);
					callback(!count);
				});
			},
			message: "A unique email address is required."
		}  
	},
	hashedPassword: {
		type: String,
		validate: {
			validator: function() {
				console.log("validator password = " + this._password);
				if (this._password) {
					return true;
				} else {
					return false;
				}
			},
			message: "A password is required."
		},
		validate: {
			validator: function() {
				if (this._confirmPassword) {
					return true;
				} else {
					return false;
				}
			},
			message: "A confirmation password is required."
		},
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
	console.log('virtual password = ' + password);
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

UserSchema.path('hashedPassword').validate(function(v) {
	console.log("test password = " + this._password);
});

var User = mongoose.model('User', UserSchema);

module.exports = User;

