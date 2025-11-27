import dotenv from "dotenv"
import { injectable } from "inversify"
dotenv.config()

export interface IConfig {
	PORT: number
	MONGODB_URL: string
}

@injectable()
export class Config implements IConfig {
	PORT: number
	MONGODB_URL: string


	constructor() {
		this.PORT = process.env["PORT"] as unknown as number
		this.MONGODB_URL = process.env["MONGODB_URL"] as string		
	}
}
