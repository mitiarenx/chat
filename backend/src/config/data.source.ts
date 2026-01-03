import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entities/users.entity";
import path from "path";

export const appDataSource = new DataSource({
	type: "better-sqlite3",
	database: path.join(__dirname, "../data/data.db"),
	synchronize: true,
	logging: true,
	entities: [User],
	migrations: [],
	subscribers: [],
});
