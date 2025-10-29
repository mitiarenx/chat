const Fastify = require('fastify');
const Dotenv = require('dotenv');

const fastify = Fastify({logger: false});
Dotenv.config({quiet: true});

fastify.get('/chat', (request, reply) => {
	reply.header("Content-Type", "text/html")
	.send("<head><title>BACKEND</title></head> \
		We are entering the chat endpoint");
});

fastify.get('/', (request, reply) => {
	reply.header("Content-Type", "text/html")
	.send("<head><title>BACKEND</title></head> \
		Hello World!");
});

const port = process.env.PORT || 3000;

fastify.listen({ port: `${port}`}, (err, address) => {
	if (err) {
		fastify.log.error(err);
		process.exit(1);
	}
	console.log(`Server listening on ${port}`);
});
