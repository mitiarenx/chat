import dotenv from "dotenv";

dotenv.config();

interface Config {
	port: number,
	server: string,
	node: string
}

const config: Config = {
	port: parseInt(process.env.PORT || "3000"),
	server: process.env.SERVER_NAME || "localhost",
	node: process.env.NODE_ENV || "production"
};

export default config;
