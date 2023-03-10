const mongoose = require('mongoose');
const validator = require('validator');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "Please enter your name"],
		maxLength: [30, "Name should not contain more than 30 characters"],
		minLength: [1, "Name should have atleast 1 character"]
	},
	email: {
		type: String,
		required: [true, "Please enter your email"],
		unique: true,
		validate: [validator.isEmail, "Please enter a valid email"]
	},
	password: {
		type: String,
		required: [true, "Please enter your password"],
		minLength: [8, "Password should have atleast 8 characters"],
		select: false
	},
	avatar: {
		public_id: {
			type: String,
			required: true
		},
		url: {
			type: String,
			required: true
		}
	},
	role: {
		type: String,
		default: "user"
	},
	resetPasswordToken: String,
	resetPasswordExpire: Date
})

userSchema.pre("save", async function(next) {
	if(!this.isModified("password")){
		next();
	}
	this.password = await bcryptjs.hash(this.password, 10);
})

//JWT token
userSchema.methods.getJWTtoken = function() {
	return jwt.sign({id: this._id}, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRE
	})
}

//Compare password
userSchema.methods.comparePassword = async function(enteredPassword) {
	return await bcryptjs.compare(enteredPassword, this.password);
}

//Generating password reset token
userSchema.methods.getResetPasswordToken = function() {
	//generating token
	const resetToken = crypto.randomBytes(20).toString("hex");

	//hashing and adding resetPasswordToken
	this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

	this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

	return resetToken;
}

module.exports = mongoose.model("User", userSchema);