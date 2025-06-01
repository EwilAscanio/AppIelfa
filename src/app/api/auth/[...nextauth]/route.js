// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { conn } from "@/libs/mariadb";
import bcrypt from "bcrypt";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        login: { // Asegúrate de que el nombre del campo coincida con lo que envías desde el formulario
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
        // --- Paso 1: Validar que se enviaron credenciales ---
        if (!credentials || !credentials.login || !credentials.password) {
          console.error("Missing login or password credentials.");
          throw new Error("Por favor, introduce tu usuario y contraseña.");
        }

        let userFound;
        try {
          // --- Paso 2: Buscar el usuario en la base de datos de forma segura ---
          // Usar '?' para la sentencia preparada es CRUCIAL para evitar inyecciones SQL
          userFound = await conn.query(
            `SELECT * FROM tbusuarios WHERE login_usr = ?`,
            [credentials.login.trim()] // El valor para '?'
          );
        } catch (dbError) {
          console.error("Error al consultar la base de datos:", dbError);
          throw new Error("Error interno del servidor al verificar usuario.");
        }

        // --- Paso 3: Verificar si el usuario fue encontrado (CORRECCIÓN) ---
        // userFound será un array, si está vacío, el usuario no existe
        if (!userFound || userFound.length === 0) {
          console.warn(`Intento de login fallido: Usuario '${credentials.login}' no encontrado.`);
          throw new Error("Usuario no encontrado");
        }

        // --- Paso 4: Comparar la contraseña hasheada ---
        const matchPassword = await bcrypt.compare(
          credentials.password,
          userFound[0].password_usr // Acceder al primer resultado del array
        );

        if (!matchPassword) {
          console.warn(`Intento de login fallido: Contraseña inválida para el usuario '${userFound[0].login_usr}'.`);
          throw new Error("Contraseña inválida");
        }

        // --- Paso 5: Devolver el objeto de usuario (si la autenticación es exitosa) ---
        // NextAuth usará este objeto para crear la sesión
        console.log(`Usuario '${userFound[0].login_usr}' autenticado exitosamente.`);
        return {
          id: userFound[0].id_usr, // Incluye el ID, es buena práctica para la sesión
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
  // Opcional: Callbacks para añadir datos al token JWT y a la sesión
  // Esto es bueno si quieres acceder a 'role' o 'id' desde session.user en el cliente o API routes
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.login = user.login; // Puedes añadir el login también si lo necesitas
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