const ErrorHandler = require('../utils/ErrorHandler.js');

module.exports = (err, req, res, next) => {
	err.statusCode = err.statusCode || 500;
	err.message = err.message || "internal server error";

	//Wrong Mongodb Id error
	if(err.name === "CastError"){
		const message = `Resource not found. Invalid ${err.path}`;
		err = new ErrorHandler(message, 400)
	}

	//Mongoose Duplicate key error
	if(err.code === 11000){
		const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
		err = new ErrorHandler(message, 400);
	}

	//Invalid JWT errr
	if(err.name === "JsonWebTokenError"){
		const message = "Json web token in invalid, please try again";
		err = new ErrorHandler(message, 400);
	}

	//Invalid JWT errr
	if(err.name === "TokenExpiredError"){
		const message = "Json web token in expired, please try again";
		err = new ErrorHandler(message, 400);
	}	

	res.status(err.statusCode).json({
		success: false,
		message: err.message,
		errStatus: err.statusCode,
		error: err.stack
	});
}