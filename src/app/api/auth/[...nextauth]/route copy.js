import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { conn } from "@/libs/mariadb";
import bcrypt from "bcrypt";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Login",
          type: "text",
          placeholder: "Login",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "123456",
        },
      },
      async authorize(credentials, req) {
        const userFound = await conn.query(
          `SELECT * FROM tbusuarios where login_usr="${credentials.login.trim()}"`
        );

        if (!userFound && userFound == []) throw new Error("user not found");

        const matchPassword = await bcrypt.compare(
          credentials.password,
          userFound[0].password_usr
        );

        if (!matchPassword) throw new Error("contraseña inválida");

        return {
          name: userFound[0].nombre_usr,
          login: userFound[0].login_usr,
          email: userFound[0].email_usr,
          role: userFound[0].rol_usr,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
