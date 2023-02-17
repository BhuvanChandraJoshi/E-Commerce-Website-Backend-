const Order = require('../models/orderModel.js');
const Product = require('../models/productModel.js');
const ErrorHandler = require('../utils/ErrorHandler.js');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors.js');
const ApiFeatures = require('../utils/ApiFeatures.js');

//create new order
exports.newOrder = catchAsyncErrors(async (req, res, next) => {
	const {
		shippingInfo, 
		orderItems, 
		paymentInfo, 
		itemsPrice, 
		taxPrice, 
		shippingPrice,
		totalPrice
	} = req.body;

	const order = await Order.create({
		shippingInfo, 
		orderItems, 
		paymentInfo, 
		itemsPrice, 
		taxPrice, 
		shippingPrice,
		totalPrice,
		paidAt: Date.now(),
		user: req.user._id
	})

	res.status(201).json({
		success: true,
		order
	})
})

//get single order
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
	const order = await Order.findById(req.params.id).populate("user", "name email");
	if(!order){
		return next(new ErrorHandler(`Cannot find an order for given id ${req.params.id}`, 404))
	}
	res.status(201).json({
		success: true,
		order
	})
})

//get logged in user orders
exports.getUserOrders = catchAsyncErrors(async (req, res, next) => {
	const orders = await Order.find({user: req.user._id});
	
	res.status(201).json({
		success: true,
		orders
	})
})

//get all orders --admin
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
	const orders = await Order.find();
	let totalAmount = 0;
	orders.forEach(order => {
		totalAmount += order.totalPrice;
	});
	res.status(201).json({
		success: true,
		totalAmount,
		orders
	})
})

//update order status --admin
exports.updateOrderStatus = catchAsyncErrors(async (req, res, next) => {
	 const order = await Order.findById(req.params.id);
	 if(!order){
		return next(new ErrorHandler(`Cannot find an order for given id ${req.params.id}`, 404))
	}
	 if(order.orderStatus === "delivered"){
	 	return next(new ErrorHandler("You have already delivered this order", 400));
	 }

	 order.orderItems.forEach(async (order) => {
	 	await updateStock(order.product, order.quantity);
	 })

	 order.orderStatus = req.body.status;

	 if(req.body.status === "delivered"){
	 	order.deliveredAt = Date.now();
	 }

	 await order.save({validateBeforeSave: false});

	 res.status(201).json({
	 	success:  true
	 })
})

async function updateStock (productId, quantity) {
	const product = await Product.findById(productId);
	product.stock -= quantity;
	await product.save({validateBeforeSave: false});
}

//delete order --admin
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
	const order = await Order.findById(req.params.id);
	if(!order){
		return next(new ErrorHandler(`Cannot find an order for given id ${req.params.id}`, 404))
	}
	await order.remove();
	res.status(201).json({
		success:  true
	})
})