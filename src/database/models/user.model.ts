import { model, Schema } from "mongoose"

export interface IUser {
	id: string

}

const userSchema = new Schema<IUser>({
	
})

export const UserModel = model<IUser>("User", userSchema)
