import { FiMenu, FiMail, FiBell } from "react-icons/fi";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react"; // 👈 Importa useSession
import PropTypes from "prop-types";
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
      <div className="flex items-center justify-between px-6 py-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Toggle sidebar"
        >
          <FiMenu className="w-6 h-6 text-gray-600" />
        </button>

        <div className="flex items-center">
          <img
            src={userImage}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover"
            width={40}
            height={40}
          />
          <div className="ml-3">
            <p className="font-semibold text-gray-800">{userName}</p>
            <p className="text-sm text-gray-500">{userRole === 1 ? "Administrador" : "Usuario"}</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <LinkSignout />
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
