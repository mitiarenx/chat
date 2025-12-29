import express from "express";
import config from "./config";
import { Express, Request, Response } from "express";
import path from "path";

const server: Express = express();

if (config.node === "production") {
	server.use(express.static(path.join(__dirname, "../../../frontend/dist")));
	server.get("*", (req: Request, rep: Response) => {
		rep.sendFile(path.join(__dirname, "../../../frontend/dist/index.html"));
	});
}

server.listen(config.port, () => {
	console.log(`Server listening on ${config.port}`);
});
