const User = require('../models/userModel.js');
const ErrorHandler = require('../utils/ErrorHandler.js');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors.js');
const sendToken = require('../utils/jwtToken.js');
const sendEmail = require('../utils/sendEmail.js');

const crypto = require('crypto');

//Register a user
exports.registerUser = catchAsyncErrors( async (req, res, next) => {
	const {name, email, password} = req.body;
	const user = await User.create({
		name,
		email,
		password,
		avatar: {
			public_id: "this is sample id",
			url:"profilePicURL"
		}
	});
	sendToken(user, 201, res);
});

//Login User
exports.loginUser = catchAsyncErrors( async (req, res, next) => {
	const {email, password} = req.body;
	if(!email || !password){
		return next(new ErrorHandler("Please enter both email and password", 400));
	}
	const user = await User.findOne({email}).select("+password");
	if(!user){
		return next(new ErrorHandler("Please enter valid email and password", 401));
	}
	const isPasswordMatched = await user.comparePassword(password);
	if(!isPasswordMatched){
		return next(new ErrorHandler("Please enter valid email and password", 401));
	}
	sendToken(user, 200, res);
})

//Logout User
exports.logoutUser = catchAsyncErrors( async (req, res, next) => {
	res.cookie('token', null, {
		expires: new Date( Date.now()),
		httpOnly: true
	})

	res.status(200).json({
		success: true,
		message: "Logged out"
	})
})

//Forgot Password
exports.forgotPassword = catchAsyncErrors( async (req, res, next) => {
	const user = await User.findOne({email: req.body.email});
	if(!user){
		return next(new ErrorHandler("User not found", 404));
	}
	const resetToken = user.getResetPasswordToken();
	await user.save({validateBeforeSave: false});
	const resetPasswordURL = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;
	const message = `Your reset password token is: \n\n ${resetPasswordURL}`;
	try{
		await sendEmail({
			email: user.email,
			subject: `Ecommerce password recovery`,
			message: message
		});
		res.status(200).json({
			success: true,
			message: `Reset email sent to ${user.email} successfully`
		})
	}
	catch(error){
		user.resetPasswordToken = null;
		user.resetPasswordExpire = null;
		await user.save({validateBeforeSave: false});
		return next(new ErrorHandler(error.message, 500));
	}
})

//Reset Password
exports.resetPassword = catchAsyncErrors( async (req, res, next) => {
	//creating token hash
	const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

	const user = await User.findOne({
		resetPasswordToken,
		resetPasswordExpire: {$gt: Date.now()}
	});

	if(!user){
		return next(new ErrorHandler("Reset password token is either invalid or expired", 400));
	}

	if(req.body.password !== req.body.confirmPassword){
		return next(new ErrorHandler("Password does not match", 400));
	}

	user.password = req.body.password;
	user.resetPasswordToken = undefined;
	user.resetPasswordExpire = undefined;

	await user.save();

	sendToken(user, 200, res);
})

//Get user detail
exports.getUserDetail = catchAsyncErrors( async (req, res, next) => {
	const user = await User.findById(req.user.id);
	res.status(200).json({
		success: true,
		user
	})
})

//Update user password
exports.updatePassword = catchAsyncErrors( async (req, res, next) => {
	const user = await User.findById(req.user.id).select("+password");
	const isPasswordMatched = await user.comparePassword(req.body.oldPassword);
	if(!isPasswordMatched){
		return next(new ErrorHandler("Old password is incorrect", 400));
	}
	if(req.body.newPassword !== req.body.confirmPassword){
		return next(new ErrorHandler("Password does no match", 400));
	}
	user.password = req.body.newPassword;
	await user.save();
	sendToken(user, 200, res);
})

//Update user profile
exports.updateUserProfile = catchAsyncErrors ( async (req, res, next) => {
	const newUserData = {
		name: req.body.name,
		email: req.body.email
	};

	const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
		new: true,
		runValidators: true,
		useFindAndModify: false
	});

	res.status(200).json({
		success: true
	})
})

//Get All Users (admin)
exports.getAllUsers = catchAsyncErrors ( async (req, res, next) => {
	const users = await User.find();
	res.status(200).json({
		success: true,
		users
	})
})

//Get single User (admin)
exports.getSingleUser = catchAsyncErrors ( async (req, res, next) => {
	const user = await User.findById(req.params.id);
	if(!user){
		return next(new ErrorHandler(`Could not find a user with Id: ${req.params.id}`, 400));
	}
	res.status(200).json({
		success: true,
		user
	})
})

//Update user role --Admin
exports.updateUserRole = catchAsyncErrors ( async (req, res, next) => {
	const newUserData = {
		name: req.body.name,
		email: req.body.email,
		role: req.body.role
	};

	const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
		new: true,
		runValidators: true,
		useFindAndModify: false
	});

	if(!user){
		return next(new ErrorHandler(`Could not find a user with Id: ${req.params.id}`, 400));
	}

	res.status(200).json({
		success: true
	})
})

//Delete user --Admin
exports.deleteUser = catchAsyncErrors ( async (req, res, next) => {
	
	const user = await User.findById(req.params.id);

	if(!user){
		return next(new ErrorHandler(`Could not find a user with Id: ${req.params.id}`, 400));
	}

	await user.remove();

	res.status(200).json({
		success: true,
		message: "User deleted successfully"
	})
})
