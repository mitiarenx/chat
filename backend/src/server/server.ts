import express from "express";
import config from "../config/config";
import { Express } from "express";
import { appDataSource } from "../config/data.source";
import authRoutes from "../routes/auth.routes";

const startServer = async () => {
	try {
		await appDataSource.initialize();
		const server: Express = express();
		server.use(express.json());
		server.use("/api/auth", authRoutes);
		server.listen(config.port, () => {
			console.log(`Server listening on ${config.port}`);
		});
	} catch (error) {
		if (error instanceof Error) {
			console.log("Internal Server Error:", error.message);
		} else {
			console.log("Internal Server Error:", error);
		}
	}
}

startServer();

