const Product = require('../models/productModel.js');
const ErrorHandler = require('../utils/ErrorHandler.js');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors.js');
const ApiFeatures = require('../utils/ApiFeatures.js');

//create product -- admin
exports.createProduct = catchAsyncErrors(async (req, res, next) => {
	req.body.createdBy = req.user.id;
	const product = await Product.create(req.body);
	res.status(201).json({
		success: true,
		product
	})
})

//fetch all products
exports.getAllProducts = catchAsyncErrors(async (req, res) => {
	const productCount = await Product.countDocuments();
	const resultsPerPage = 2; 
	const ApiFeature = new ApiFeatures(Product.find(), req.query).search().filter().pagination(resultsPerPage);
	const products = await ApiFeature.query;
	res.status(200).json({
		success: true,
		products,
		productCount
	})
})

//update product -- admin
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
	let product = await Product.findById(req.params.pid);
	if(!product){
		return next(new ErrorHandler("Product not found", 404));
	}
	product = await Product.findByIdAndUpdate(req.params.pid, req.body, {
		new: true,
		runValidators: true,
		useFindAndModify: false
	})
	res.status(200).json({
		success: true,
		product
	})
})

//get product details
exports.getProductDetails = catchAsyncErrors(async (req, res, next) => {
	const product = await Product.findById(req.params.pid);
	if(!product){
		return next(new ErrorHandler("Product not found", 404));
	}
	res.status(200).json({
		success: true,
		product
	})
})

//delete product -- admin
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
	const product = await Product.findById(req.params.pid);
	if(!product){
		return next(new ErrorHandler("Product not found", 404));
	}
	await product.remove();
	res.status(200).json({
		success: true,
		message: "Product deleted successfully"
	})
})

//Create new review or update old review
exports.createProductReview = catchAsyncErrors( async (req, res, next) => {
	const {comment, rating, productId} = req.body;
	const review = {
		user: req.user._id,
		name: req.user.name,
		comment,
		rating: Number(rating)
	}

	const product = await Product.findById(productId);

	const isReviewed = product.reviews.find(rev => rev.user.toString() === req.user._id.toString());

	if(isReviewed){
		product.reviews.forEach(rev => {
			if(rev.user.toString() === req.user._id.toString()){
				rev.rating = rating;
				rev.comment = comment;
			}
		})
	}
	else{
		product.reviews.push(review);
		product.noOfReviews = product.reviews.length;
	}

	let avg = 0;
	
	product.reviews.forEach(rev => {
		avg += rev.rating;
	})

	product.ratings = avg / product.reviews.length;

	await product.save({validateBeforeSave: false});

	res.status(200).json({
		success: true
	})
})

//Get all reviews of a product
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
	const product = await Product.findById(req.query.productId);
	if(!product){
		return next(new ErrorHandler("Product not found", 404));
	}
	
 	res.status(200).json({
 		success: true,
 		reviews: product.reviews
 	})
})

//delete review
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
	const product = await Product.findById(req.query.productId);
	if(!product){
		return next(new ErrorHandler("Product not found", 404));
	}
	const reviews = product.reviews.filter(rev => rev._id.toString() !== req.query.reviewId.toString());

	let avg = 0;
	
	product.reviews.forEach(rev => {
		avg += rev.rating;
	})

	const ratings = avg / product.reviews.length;
	const noOfReviews = reviews.length;
 	
 	await Product.findByIdAndUpdate(req.query.productId, {reviews, ratings, noOfReviews}, {
 		new: true,
		runValidators: true,
		useFindAndModify: false
 	});

 	res.status(200).json({
 		success: true
 	})
})