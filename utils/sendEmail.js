const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
	// const transporter = nodeMailer.createTransport({
	// 	host: process.env.SMPT_HOST,
	// 	port: process.env.SMPT_PORT,
	// 	service: process.env.SMPT_SERVICE,
	// 	auth: {
	// 		user: process.env.SMPT_EMAIL,
	// 		pass: process.env.SMPT_PASSWORD
	// 	}
	// });

	const transporter = nodemailer.createTransport({
	    host: "smtp-mail.outlook.com", // hostname
	    secureConnection: false, // TLS requires secureConnection to be false
	    port: 587, // port for secure SMTP
	    tls: {
	       ciphers:'SSLv3'
	    },
	    auth: {
	        user: process.env.SMPT_EMAIL,
	        pass: process.env.SMPT_PASSWORD
	    }
	});

	// setup e-mail data
	var mailOptions = {
	    from: 'bhuvanchandra_20077@aitpune.edu.in', // sender address (who sends)
	    to: options.email, // list of receivers (who receives)
	    subject: options.subject, // Subject line
	    text: options.message, // plaintext body
	};

	// send mail with defined transport object
	await transporter.sendMail(mailOptions, function(error, info){
	    if(error){
	        return console.log(error);
	    }

	    console.log('Message sent: ' + info.response);
	});
}

module.exports = sendEmail;