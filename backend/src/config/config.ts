interface Config {
	port: number,
	server: string,
	node: string
}

const config: Config = {
	port: parseInt("3000"),
	server: "localhost",
	node: "production"
};

export default config;
