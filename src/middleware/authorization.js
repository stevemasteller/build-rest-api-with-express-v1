"use strict";

var User = require("../models/user-model");
var auth = require("basic-auth");
var bcrypt = require("bcryptjs");
 
var authorization = function (req, res, next) {
	
	var credentials = auth(req);
	 
	if (!credentials || !credentials.name || !credentials.pass) {
		
		return res.status(401).send();
	} else {
		
		User.findOne({emailAddress: credentials.name}, function (err, emailAddress) {
			
			if (err) return next(err);
			
			if (emailAddress) {
			
				var compare = bcrypt.compareSync(credentials.pass, emailAddress.hashedPassword);
				if (compare) {
					
					req.user = emailAddress;
					return(next);
				} else {
					return res.status(401).send();
				}
			} else {
				return res.status(401).send();				
			}
		});
	}
};

module.exports = authorization;