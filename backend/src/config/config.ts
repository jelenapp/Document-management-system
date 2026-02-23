import {configDotenv} from "dotenv";

configDotenv();
export const PORT = process.env.PORT || 5000;
export const MONGO_URI = process.env.MONGO_URI || "";

export const ENV = process.env.ENV || "development";


export const NEXT_AUTH_URL = process.env.NEXTAUTH_URL || "";

export const EMAIL_USER = process.env.EMAIL_USER || "";
export const EMAIL_APP_PASS = process.env.EMAIL_APP_PASS || "";