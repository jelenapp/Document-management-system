import User from "../data/dao/UserSchema";
import {IUser, INewUser} from "../data/interfaces/IUser";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import {sendVerificationEmail} from "../mailer/mailer"

export async function createNewUser(user: INewUser): Promise<IUser | Error>{

    const hashedPassword = await bcrypt.hash(user.password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const newUser = await User.create({
        username: user.username,
        email: user.email,
        password: hashedPassword,
        verificationToken: verificationToken,
        verified: false,
    });

    await sendVerificationEmail(newUser.email, verificationToken);

    return newUser;
}

export async function deleteUserWithId(uuid: string) {
    return await User.findByIdAndDelete(uuid).exec();
}

export async function getAllUsers(): Promise<Array<IUser>> {
    return  User.find();
}

export async function getUserById(uuid: string): Promise<IUser | null> {
    return await User.findById(uuid);
}

export async function getUserWithUsername(username: string): Promise<IUser | null> {
    return await User.findOne({username: username});
}

export async function getUserWithEmail(email: string): Promise<IUser | null> {
    return await User.findOne({email: email});
}

export async function getUserByVerificationToken(verificationToken: string): Promise<IUser | null> {
    return await User.findOne({verificationToken: verificationToken});
}

export async function verifyUser(verificationToken: string): Promise<IUser | null> {

    const user: IUser | null = await User.findOne({ verificationToken: verificationToken });

    if (user){
        user.verified = true;
        user.verificationToken = undefined;
        await user.save();
    }

    return user;
}

