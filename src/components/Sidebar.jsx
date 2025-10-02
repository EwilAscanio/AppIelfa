"use client";
import { FiHome, FiUsers, FiSettings, FiBarChart2 } from "react-icons/fi";
import { FaUsersRectangle, FaPeopleGroup  } from "react-icons/fa6";
import { BiSolidReport } from "react-icons/bi";
import Link from "next/link";
import LinkSignout from "@/components/LinkSignout";
import Image from "next/image"; // Asegúrate de que estás importando Image correctamente

const Sidebar = ({ isSidebarOpen }) => {
  const menuItems = [
    {
      icon: <FiHome className="w-5 h-5" />,
      label: "Dashboard",
      path: "/auth/dashboard",
      active: true,
    },
    {
      icon: <FiUsers className="w-5 h-5" />,
      label: "Usuarios",
      path: "/auth/dashboard/usuarios",
      active: false,
    },
    {
      icon: <FiBarChart2 className="w-5 h-5" />,
      label: "Eventos",
      path: "/auth/dashboard/eventos",
      active: false,
    },
    {
      icon: <FaPeopleGroup  className="w-5 h-5" />,
      label: "Miembros",
      path: "/auth/dashboard/miembros",
      active: false,
    },
    {
      icon: <FaUsersRectangle className="w-5 h-5" />,
      label: "Asistencia",
      path: "/auth/dashboard/asistencia",
      active: false,
    },
    {
      icon: <FaUsersRectangle className="w-5 h-5" />,
      label: "Listado Asistencia",
      path: "/auth/dashboard/listado-asistencia",
      active: false,
    },
    {
      icon: <BiSolidReport  className="w-5 h-5" />,
      label: "Reporte",
      path: "/auth/dashboard/reportes",
      active: false,
    },

  ];

  return (
    <aside
      className={`${isSidebarOpen ? "w-48" : "w-14"} 
        transition-width duration-300 ease-in-out bg-white shadow-lg`}
    >
      {/* Contenedor del logo con altura fija */}
      <div className="flex items-center justify-center p-4 h-20">
        {isSidebarOpen && (
          <Image
            src="/images/LogoIelfa.png"
            alt="Logo"
            className="w-16 h-16 rounded-full"
            property=""
            width={64}
            height={64}
          />
        )}
      </div>

      <nav className={`${isSidebarOpen ? "mt-12 transition-width duration-500 ease-in-out" : "mt-0 transition-width duration-500 ease-in-out"}`}>
        
        
        {menuItems.map((item, index) => (
          <Link key={index} href={item.path}>
            <div
              className={`flex items-center px-4 py-3 ${
                item.active
                  ? "bg-purple-50 text-purple-600"
                  : "text-gray-600 hover:bg-gray-200"
              } transition-colors duration-200`}
              aria-label={item.label}
            >
              <span className={`flex items-center justify-center w-8`}>
                {item.icon}
              </span>
              <span
                className={`ml-3 font-medium transition-opacity duration-300 ${
                  isSidebarOpen ? "opacity-100" : "opacity-0"
                }`}
              >
                {item.label}
              </span>
            </div>
          </Link>
        ))}
      </nav>

      {/* <div className="absolute bottom-0 p-4">
        <LinkSignout isSidebarOpen={isSidebarOpen} />
      </div> */}
    </aside>
  );
};

export default Sidebar;
