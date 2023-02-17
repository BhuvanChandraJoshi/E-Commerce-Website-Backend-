const mongoose = require('mongoose');

const mongodbURL = ""

const connectDatabase = () => {
	mongoose.connect(mongodbURL)
	.then(data => {
		console.log(`Mongodb connected with server ${data.connection.host}`)
	})
	// .catch(err => {			//if error occurs it will be handled by "Unhandled Promise rejection" in server.js
	// 	console.log(err)
	// })
} 

module.exports = connectDatabase;