import dotenv from "dotenv";

dotenv.config();

interface Config {
	port: number,
	server: string
}

const config: Config = {
	port: parseInt(process.env.PORT || "3000"),
	server: process.env.SERVER_NAME || "localhost"
};

export default config;
