"use client";
import { signOut } from "next-auth/react";
import Link from "next/link";
import Swal from "sweetalert2";
import { FiLogOut } from "react-icons/fi";

const LinkSignout = () => {
  return (
    <Link
      className="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
      aria-label="Logout"
      href="/api/auth/signout"
      onClick={(e) => {
        e.preventDefault();
        Swal.fire({
          title: "¿Estás seguro?",
          text: "Esta acción cerrará tu sesión.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#2563eb",
          cancelButtonColor: "#d33",
          confirmButtonText: "Sí, cerrar sesión",
        }).then((result) => {
          if (result.isConfirmed) {
            signOut({ callbackUrl: "/" });
          }
        });
      }}
    >
      <FiLogOut className="w-5 h-5" />
      {/*<span
        className={`ml-3 transition-opacity duration-300 ${
          isSidebarOpen ? "opacity-100" : "opacity-0"
        }`}
      >/*/}
      <span className="ml-3">
        

        Cerrar Sesion
      </span>
    </Link>
  );
};

export default LinkSignout;
