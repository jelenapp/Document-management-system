import {PlainResource} from "./PlainResource";
import {IUser} from "../interfaces/IUser";


export type UserView = PlainResource<IUser, "password" | "verified" | "verificationToken">

export function toUserView(user: IUser): UserView{
    return {
        id: user.id,
        username: user.username,
        email: user.email
    }
}