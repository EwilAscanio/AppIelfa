// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { conn } from "@/libs/postgress";
import bcrypt from "bcrypt";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        login: {
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
        if (!credentials?.login || !credentials?.password) {
          console.error("Credenciales faltantes");
          return null; // 👈 NextAuth recomienda retornar null, no lanzar error
        }

        try {
          const result = await conn.query(
            "SELECT * FROM tbusuarios WHERE login_usr = $1",
            [credentials.login.trim()]
          );

          const user = result.rows[0]; // 👈 Aquí está la clave

          if (!user) {
            console.warn("Usuario no encontrado:", credentials.login);
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password_usr
          );

          if (!isPasswordValid) {
            console.warn("Contraseña incorrecta para:", user.login_usr);
            return null;
          }

          // ✅ Devuelve el usuario (NextAuth lo requiere con id y email)
          return {
            id: user.id_usr.toString(), // 👈 NextAuth espera id como string
            name: user.nombre_usr,
            login: user.login_usr,
            email: user.email_usr,
            role: user.id_rol, // 👈 Corregido: tu columna es id_rol, no rol_usr
            image: user.imagen_usr
          };

        } catch (error) {
          console.error("Error en authorize:", error);
          return null;
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.login = user.login;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.login = token.login;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };