import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, BeforeInsert } from "typeorm";
import bcrypt, { genSalt } from "bcrypt";

@Entity("users")
export class User {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column({ unique: true })
	email!: string;

	@Column()
	name!: string;

	@Column()
	surname!: string;

	@Column()
	password!: string;

	@Column({ type: "blob", nullable: true })
	avatar?: Buffer;

	@CreateDateColumn({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
	created!: Date;

	@BeforeInsert()
	async validate() {
		if (this.password.length < 4)
			throw new Error("Invalid password");
		if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(this.email))
			throw new Error("Invalid email");
		if (!/^[a-zA-Z]+$/.test(this.name) || !/^[a-zA-Z]+$/.test(this.surname))
			throw new Error("Invalid first name or surname");
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(this.password, salt);
		this.password = hashedPassword;
	}
}
