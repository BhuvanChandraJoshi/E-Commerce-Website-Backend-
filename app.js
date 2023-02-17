const express = require('express');
const cookieParser = require('cookie-parser');

const errorMiddleware = require('./middlewares/errorMiddleware.js');

const app = express();

app.use(express.json());
app.use(cookieParser());


//Route imports
const productRoutes = require('./routes/productRoute.js');
const userRoutes = require('./routes/userRoute.js');
const orderRoutes = require('./routes/orderRoute.js');

app.use('/api/v1', productRoutes);
app.use('/api/v1', userRoutes);
app.use('/api/v1', orderRoutes);

//Middleware for errors
app.use(errorMiddleware);

module.exports = app;