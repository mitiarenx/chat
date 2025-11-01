const Fastify = require('fastify');
const fastifyCookie = require('@fastify/cookie');
const Dotenv = require('dotenv');
const path = require('path');
const fastifyStatic = require('@fastify/static');
const Database = require('better-sqlite3');
const jwt = require('jsonwebtoken');
const cors = require('@fastify/cors');
const { generateToken, sendEmails, emailValid } = require('./utils.js');

function connectDBUser() {
	try {
		const db = new Database('database.sqlite');
		db.prepare(`
			CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			username TEXT NOT NULL UNIQUE,
			mail TEXT NOT NULL UNIQUE,
			password TEXT NOT NULL)`).run();
		return db;
	} catch (error) {
		console.error(`Error connecting to SQLite: ${error}`);
	}
}

const fastify = Fastify({logger: false});
fastify.register(fastifyCookie);
Dotenv.config({quiet: true});
const db = connectDBUser();

fastify.register(cors, {
	origin: "http://localhost:5173",
	methods: ['GET', 'POST', 'PUT', 'DELETE'],
	credentials: true
});

function connectDBMessage() {
	try {
		db.prepare(`CREATE TABLE IF NOT EXISTS message (
			message_id INTEGER PRIMARY KEY AUTOINCREMENT,
			sender_id INTEGER NOT NULL,
			receiver_id INTEGER NOT NULL,
			text TEXT,
			image TEXT)`).run();
	} catch (error) {
		console.log("Error creating Message Table: ", error);
	}
}

const dir = path.resolve();

/* -------------------- AUTH GET -------------------- */

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

fastify.get('/auth/check', (request, reply) => {
	try {
		const token = request.cookies.jwt;
		if (!token) {
			return reply.status(401).send({ message: "Not Authenticated" });
		}
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const loginUserId = decoded.id;
		const user = db.prepare("SELECT id, username, name, mail FROM users WHERE id = ?").get(loginUserId);
		if (!user) {
			return reply.status(404).send({ message: "User not found" });
		}
		reply.status(200).send({ id: user.id, username: user.username, name: user.name, mail: user.mail });
	} catch (error) {
		reply.status(401).send({ message: "Invalid or expired token" });
	}
});

/* -------------------- AUTH POST -------------------- */

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

/* -------------------- MESSAGE GET -------------------- */

fastify.get('/contacts', (request, reply) => {
	try {
		const token = request.cookies.jwt;
		if (!token) {
			return reply.status(401).send("Not Athenticated"); }
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const loginUserId = decoded.id;
		console.log(loginUserId);
		const filteredUsers = db.prepare("SELECT * FROM users WHERE id != ?").all(loginUserId);
		if (!filteredUsers) {
			reply.status(200).send("No other users");
		} else {
			reply.status(200).send(filteredUsers);
		}
	} catch (error) {
		console.log(error);
		reply.status(500).send("Internal Server Error");
	}
});

fastify.get('/chats', (request, reply) => {
	try {
		const token = request.cookies.jwt;
		if (!token) {
			return reply.status(401).send("Not Athenticated"); }
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const loginUserId = decoded.id;
		
		const messages = db.prepare(`SELECT sender_id, receiver_id FROM message WHERE
			(sender_id = ? or receiver_id = ?)`)
			.all(loginUserId, loginUserId);
		if (messages.length === 0) {
			return reply.status(200).send([]);
		}
		const chatPartnersId = new Set();
		messages.forEach((msg) => {
			msg.sender_id.toString() === loginUserId.toString()
				? chatPartnersId.add(msg.receiver_id.toString())
				: chatPartnersId.add(msg.sender_id.toString());
		});
		const ids = Array.from(chatPartnersId);
		const placeholders = ids.map(() => '?').join(', ');
		const chatPartnersQuery = db.prepare(`
			SELECT id, name, username, mail FROM users 
			WHERE id IN (${placeholders})`);
		const chatPartners = chatPartnersQuery.all(...ids);
		reply.status(200).send(chatPartners);
	} catch(error) {
		console.log(error);
		reply.status(500).send("Internal Server Error");
	}
});

fastify.get('/messages/:id', (request, reply) => {
	try {
		const token = request.cookies.jwt;
		if (!token) {
			return reply.status(401).send("Not Athenticated"); }
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const loginUserId = decoded.id;
		const chatFriend = request.params.id;

		const findMessages = db.prepare(`SELECT * FROM message WHERE
			(sender_id = @myId AND receiver_id = @otherId) OR
			(sender_id = @otherId AND receiver_id = @myId)
			ORDER BY rowid ASC`)

		const messages = findMessages.all({
			myId: loginUserId,
			otherId: chatFriend
		});
		reply.status(200).send(messages);
	} catch(error) {
		console.log(error);
		reply.status(500).send("Internal Server Error");
	}
});

/* -------------------- MESSAGE POST -------------------- */

fastify.post('/send/:id', (request, reply) => {
	try {
		const { text, image } = request.body;
		const token = request.cookies.jwt;
		if (!token) {
			return reply.status(401).send("Not Athenticated"); }
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		const senderId = decoded.id;
		const receiverId = request.params.id;

		if (!text && !image) {
			return reply.status(400).send("Must have text or image"); }
		if (senderId === receiverId) {
			return reply.status(400).send("Can't send message to yourself"); }
		let imageUrl = image;
		const messy = db.prepare(`INSERT INTO message (sender_id, receiver_id, text, image)
			VALUES (?, ?, ?, ?)`).run(senderId, receiverId, text || null, imageUrl || null);
		const messageId = messy.lastInsertRowid;
		const newMessage = db.prepare(`SELECT * FROM message WHERE message_id = ?`).get(messageId);
		reply.status(200).send(newMessage);
	} catch(error) {
		console.log(error);
		reply.status(500).send("Internal Server Error");
	}
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
	db; connectDBMessage();
});

module.exports = { db };
