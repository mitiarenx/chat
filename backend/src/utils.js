const jwt = require('jsonwebtoken');

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

module.exports = { generateToken };
