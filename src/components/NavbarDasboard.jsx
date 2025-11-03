import { FiMenu, FiLogOut } from "react-icons/fi";
import { useSession } from "next-auth/react";
import PropTypes from "prop-types";
import Image from "next/image";
import LinkSignout from "./LinkSignout";

const NavbarDashboard = ({ toggleSidebar, messages, notifications }) => {
  // 👇 Obtén la sesión directamente (sin axios ni endpoints)
  const { data: session } = useSession();

  // Extrae los datos del usuario
  const userName = session?.user?.name || "Cargando...";
  const userRole = session?.user?.role || "Cargando...";
  const userImage = (session?.user?.image || "/images/defaultusuario.jpg").replace(/^\/public/, "");


  return (
    <header className="bg-white shadow-sm">
      <div className="grid grid-cols-3 items-center px-4 sm:px-6 py-4">
        <div className="flex justify-start">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-600"
            aria-label="Toggle sidebar"
          >
            <FiMenu className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
          </button>
        </div>

        <div className="flex items-center justify-center min-w-0">
          <Image
            src={userImage}
            alt="Profile"
            width={32}
            height={32}
            className="rounded-full object-cover flex-shrink-0 sm:w-10 sm:h-10"
          />
          <div className="ml-2 sm:ml-3 min-w-0">
            <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">{userName}</p>
            <p className="text-xs sm:text-sm text-gray-500 truncate">{userRole === 1 ? "Administrador" : "Usuario"}</p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={(e) => {
              e.preventDefault();
              import('sweetalert2').then((Swal) => {
                Swal.default.fire({
                  title: "¿Estás seguro?",
                  text: "Esta acción cerrará tu sesión.",
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonColor: "#2563eb",
                  cancelButtonColor: "#d33",
                  confirmButtonText: "Sí, cerrar sesión",
                }).then((result) => {
                  if (result.isConfirmed) {
                    import('next-auth/react').then(({ signOut }) => {
                      signOut({ callbackUrl: "/" });
                    });
                  }
                });
              });
            }}
            className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-colors duration-200"
            aria-label="Logout"
          >
            <LinkSignout className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
          </button>
        </div>
      </div>
    </header>
  );
};

NavbarDashboard.propTypes = {
  toggleSidebar: PropTypes.func.isRequired,
  messages: PropTypes.number.isRequired,
  notifications: PropTypes.number.isRequired,
};

export default NavbarDashboard;
