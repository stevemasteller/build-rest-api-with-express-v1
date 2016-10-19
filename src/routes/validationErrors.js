/************************************************************/
/** Formats validation errors
/************************************************************/

var validationErrors = function (err, res, next) {

	// if validation error save in following JSON format for angular app.
	// { "message": "Validation Failed", "errors": { "property": [ { "code": "", "message": "" }, ... ] } } 
	if (err.name === "ValidationError") {
		
		var validation = {
			message: "Validation Failed",
			errors: {}
		};                                                               		for (var i in err.errors) {
			validation.errors[i] = [{
				code: 400,
				message: err.errors[i].message
			}];
		}
		return res.status(400).json(validation);;
	} else {
		
		// if some other error send to error handler
		return next(err);
	}
}

module.exports = validationErrors;
