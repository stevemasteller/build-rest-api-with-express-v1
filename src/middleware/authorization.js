"use strict";
/************************************************************/
/** Basic authorization
/************************************************************/

var User = require("../models/user-model");
var auth = require("basic-auth");
var bcrypt = require("bcryptjs");
 
var authorization = function (req, res, next) {
	
	// ensure user and password exist
	var credentials = auth(req);
	if (!credentials || !credentials.name || !credentials.pass) {
		
		// user not authorized because of missing credentials
		return res.status(401).send();
	} else {

		// find the user data to get the hashed password for data base
		User.findOne({emailAddress: credentials.name}, function (err, user) {
			
			if (err) return next(err);
			
			if (user) {
				
				// hash password and compare to hashedPassword from database
				var compare = bcrypt.compareSync(credentials.pass, user.hashedPassword);

				if (compare) {
					
					// user authorized
					req.user = user;
					return next();
					
				} else {
					
					// user not authorized because password is wrong
					return res.status(401).send();
				}
			} else {
				
				// user not authorized because they are not registered
				return res.status(401).send();				
			}
		});
	}
};

/************************************************************/
/** export authorization
/************************************************************/
module.exports = authorization;
