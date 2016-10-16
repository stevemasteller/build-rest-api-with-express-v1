var validationErrors = function (err, res) {

	console.log("validationErrors reached")
	// if error save in following JSON format for angular app.
	// { "message": "Validation Failed", "errors": { "property": [ { "code": "", "message": "" }, ... ] } } 
	if (err.name === "ValidationError") {
		
		var validation = {
			message: "Validation Failed",
			errors: {}
		};
	  
		for (var i in err.errors) {
			validation.errors[i] = [{
				code: 400,
				message: err.errors[i].message
			}];
		}
		console.log(validation);
		return res.status(400).json(errorMessages);;
	} else {
		return next(err);
	}
}

module.exports = validationErrors;
