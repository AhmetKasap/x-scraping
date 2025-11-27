import dotenv from "dotenv"
import { injectable } from "inversify"
dotenv.config()

export interface IConfig {
	PORT: number
	MONGODB_URL: string
	TWITTER_USERNAME: string
	TWITTER_PASSWORD: string
}

@injectable()
export class Config implements IConfig {
	PORT: number
	MONGODB_URL: string
	TWITTER_USERNAME: string
	TWITTER_PASSWORD: string


	constructor() {
		this.PORT = process.env["PORT"] as unknown as number
		this.MONGODB_URL = process.env["MONGODB_URL"] as string
		this.TWITTER_USERNAME = process.env["TWITTER_USERNAME"] as string
		this.TWITTER_PASSWORD = process.env["TWITTER_PASSWORD"] as string
	}
}
