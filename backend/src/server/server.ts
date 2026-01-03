import express from "express";
import config from "./config";
import { Express } from "express";

const server: Express = express();

server.listen(config.port, () => {
	console.log(`Server listening on ${config.port}`);
});
