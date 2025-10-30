const Fastify = require('fastify');
const Dotenv = require('dotenv');
const path = require('path');
const fastifyStatic = require('@fastify/static');

const fastify = Fastify({logger: false});
Dotenv.config({quiet: true});

const dir = path.resolve();

fastify.get('/chat', (request, reply) => {
	reply.header("Content-Type", "text/html")
	.send("<head><title>BACKEND</title></head> \
		We are entering the chat endpoint");
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
});
