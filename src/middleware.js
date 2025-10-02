// import { withAuth } from "next-auth/middleware";

// export default withAuth(
//   function middleware(req) {
//     // Aquí puedes agregar lógica adicional si es necesario
//   },
//   {
//     callbacks: {
//       authorized: ({ token }) => !!token,
//     },
//   }
// );

// export const config = {
//   matcher: ["/auth/dashboard/:path*"],
// };

export { default } from "next-auth/middleware";

//Utilizamos esta configuracion para bloquear too acceso a las paginas si no esta logueado.
export const config = { matcher: ["/auth/dashboard/:path*"] };