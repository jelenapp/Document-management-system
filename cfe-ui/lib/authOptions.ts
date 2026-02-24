import { connectMongoDB } from "./mongodb";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { AuthOptions } from "next-auth";
import {getRequestSingle} from "../src/app/api/serverRequests/methods";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {},

      async authorize(credentials) {
        if (
          !credentials ||
          typeof credentials !== "object" ||
          !("email" in credentials) ||
          !("password" in credentials)
        ) {
          throw new Error("Invalid credentials");
        }

        const { email, password } = credentials as { email: string; password: string };
        //await connectMongoDB();
        //const user = await User.findOne({ email });

        const userData = await getRequestSingle(`users/email/${encodeURIComponent(email)}`);
        const payload = await userData.json();
        const user = payload?.data; // user
        if (!user) return null;
        if (!userData.ok) {
          console.log("userData status:", userData.status);
          return null;
        }
        console.log("user keys:", Object.keys(user || {}));
        console.log("verified:", user?.verified, "hasPassword:", !!user?.password);
        if (!user) return null;

        const passwordsMatch = await bcrypt.compare(password, user.password);
        if (!passwordsMatch) return null;

        if (!user.verified)
          throw new Error("Email is not verified!");

        return {
          id: user._id,
          email: user.email,
          username: user.username,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24, 
  },
  callbacks: {
    
  async jwt({ token, user }) {
    if (user) {
      token.id = (user as any).id || (user as any)._id || token.id;
      token.username = (user as any).username || token.username;
    }
    return token;
  },

  async session({ session, token }) {
  if (token) {
    (session.user as any).id = token.id as string;
    (session.user as any).username = token.username as string;
  }
  return session;
  },
},

  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: "/",
  },
};
