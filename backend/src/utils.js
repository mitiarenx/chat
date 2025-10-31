const jwt = require('jsonwebtoken');
const Dotenv = require('dotenv');
Dotenv.config({quiet: true});

const { Resend } = require('resend');
const resend = new Resend(process.env.API_CHAT);

const generateToken = (id, reply) => {
	const token = jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "7d"});

	reply.cookie("jwt", token, {
		maxAge: 7 * 24 * 60 * 60 * 1000,
		httpOnly: true,
		sameSite: "strict", 
		secure: process.env.NODE_ENV === "development" ? false : true
	});
	return token;
}

const emailValid = (mail) => {
	const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
	return regex.test(mail);
}

const sendEmails = async (mail) => {
	const { data, error } = await resend.emails.send({
		from: `${process.env.EMAIL_NAME} <${process.env.EMAIL_FROM}>`,
		to: mail,
		subject: "Pong game",
		html: "<h1>Welcome to PONG PONG</h1>"
	});
	if (error) {
		console.log("Failed to send email: ", error);
		throw error;
	}
	console.log("Welcome Email sent successfully!");
}

module.exports = { generateToken, sendEmails, emailValid };
