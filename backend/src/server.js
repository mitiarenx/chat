const Fastify = require('fastify');
const fastifyCookie = require('@fastify/cookie');
const Dotenv = require('dotenv');
const path = require('path');
const fastifyStatic = require('@fastify/static');
const Database = require('better-sqlite3');
const { generateToken, sendEmails, emailValid } = require('./utils.js');

function connectDB() {
	try {
		const db = new Database('database.sqlite');
		db.prepare(`
			CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			username TEXT NOT NULL UNIQUE,
			mail TEXT NOT NULL UNIQUE,
			password TEXT NOT NULL,
			message TEXT)
		`).run();
		return db;
	} catch (error) {
		console.error(`Error connecting to SQLite: ${error}`);
	}
}

const fastify = Fastify({logger: false});
fastify.register(fastifyCookie);
Dotenv.config({quiet: true});
const db = connectDB();

const dir = path.resolve();

fastify.get('/chat', (request, reply) => {
	reply.header("Content-Type", "text/html")
	.send("<head><title>BACKEND</title></head> \
		We are entering the chat endpoint");
});

fastify.get('/logout', (request, reply) => {
	reply.header("Content-Type", "text/html")
	.send("<head><title>BACKEND</title></head> \
		We are entering the logout endpoint");
});

fastify.get('/login', (request, reply) => {
	reply.header("Content-Type", "text/html")
	.send("<head><title>BACKEND</title></head> \
		We are entering the login endpoint");
});

fastify.get('/signup', (request, reply) => {
	reply.header("Content-Type", "text/html")
	.send("<head><title>BACKEND</title></head> \
		We are entering the signup endpoint");
});

fastify.post('/login', (request, reply) => {
	const { mail, password } = request.body;

	try {
		const user = db.prepare("SELECT * FROM users WHERE mail = ?").get(mail);
		if (!user) {
			return reply.status(400).send("Invalid credentials"); }
		if (user.password !== password) {
			return reply.status(400).send("Invalid credentials"); }
		generateToken(user.id, reply);
		reply.status(200).send(`User with ID ${user.id} logged in succesfully`);
	} catch (error) {
		console.log(error);
		reply.status(500).send("Internal Server Error");
	}
});

fastify.post('/signup', (request, reply) => {
	const { name, username, mail, password } = request.body;
	if (!name || !mail || !password || !username) {
		return reply.status(400).send("All fields are required");
	}
	if (password.length < 6) {
		return reply.status(400).send("Passsword must be at least 6 character");
	}
	try {
		const user = db.prepare("SELECT * FROM users WHERE username = ? OR mail = ?")
			.get(username, mail);
		if (user) {
			return reply.status(400).send("Username or mail already exists"); }
		if (!emailValid(mail)) {
			return reply.status(400).send("Email not valid"); }
		const newUser = db.prepare("INSERT INTO users (name, username, mail, password) VALUES (?, ?, ?, ?)")
			.run(name, username, mail, password);
		generateToken(newUser.lastInsertRowid, reply);
		try { sendEmails(mail);
		} catch (error) {}
		return reply.status(201).send("User succesfully registered");
	} catch (error) {
		console.log("Unexpected: ", error);
		return reply.status(500).send("Internal Server Error");
	}
});

fastify.post('/logout', (request, reply) => {
	reply.cookie("jwt", "", { maxAge: 0 });
	reply.status(200).send("User successfully logged out");
});

const port = process.env.PORT || 3000;

if (process.env.NODE_ENV === "production") {
	fastify.register(fastifyStatic, {
		root: path.join(dir, "..", "frontend", "dist")
	});
	fastify.setNotFoundHandler((request, reply) => {
		reply.sendFile(path.join(dir, "..", "frontend", "dist", "index.html"))
	});
}

fastify.listen({ port: `${port}`}, (err, address) => {
	if (err) {
		console.log(err);
		process.exit(1);
	}
	console.log(`Server listening on ${port}`);
	/*CONNECT DB*/ db;
});
