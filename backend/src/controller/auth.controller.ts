import { Request, Response } from "express";
import { User } from "../entities/users.entity";
import { appDataSource } from "../config/data.source";

const users = appDataSource.getRepository(User);

export const signup = async (req: Request, rep: Response) => {
	const { email, name, surname, password } = req.body;
	if (!email || !name || !surname || !password)
		return rep.status(400).send({ error: "All fields are required" });
	const existingUser = await users.findOneBy({ email: email });
	if (existingUser)
		return rep.status(400).send({ error: "Email already in use" });
	try {
		const newUser = users.create({ email: email, name: name, surname: surname, password: password });
		await users.save(newUser);
		return rep.status(201).send({ id: newUser.id });
	} catch(error) {
		if (error instanceof Error)
			return rep.status(400).send({ error: error.message });
	}
}
