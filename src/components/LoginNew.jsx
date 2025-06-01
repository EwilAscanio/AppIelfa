"use client";
import React, { useState } from "react";

import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FaSpinner } from "react-icons/fa";
import { LuUser, LuLock, LuArrowRight } from "react-icons/lu";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Link from "next/link";
import Image from "next/image";

const AuthComponent = () => {
  // FORMULARIO LOGIN
  const [error, setError] = useState(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  //Funcion a utilizar el formulario
  const onSubmit = handleSubmit(async (data) => {
    // Aqui se envian los datos para el acceso, es decir los campos
    //que va a verificar el credencials.
    const resp = await signIn("credentials", {
      login: data.login_usr,
      password: data.password_usr,
      redirect: false,
    });

    if (resp.error) {
      Swal.fire({
        title: "Credenciales Incorrectas",
        text: "Por Favor Verifique.",
        icon: "warning",
        confirmButtonColor: "#d33",
      });
      setError(resp.error);
    } else {
      router.push(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/auth/dashboard`);
      router.refresh();
    }
  });

  const backgroundImage = "/images/fondo_sesion.jpg";

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Image
  src={backgroundImage}
  alt="Fondo de Login"
  fill
  style={{ objectFit: "cover" }}
  className=""
/>

      <div className="max-w-md w-full space-y-8 bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-2xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? "Inicio de Sesion" : "Create your account"}
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
          {/* Campo numero 1 del Formulario LOGIN*/}

          <div className="relative rounded-md shadow-sm space-y-4">
            <LuUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              className={`appearance-none rounded-lg block w-full pl-10 pr-3 py-2 border ${
                errors.name ? "border-red-500" : "border-gray-300"
              } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition duration-200`}
              placeholder="Full Name"
              {...register("login_usr", {
                required: {
                  value: true,
                  message: "campo requerido",
                },
                minLength: {
                  value: 2,
                  message: "El nombre debe tener mínimo 2 caracteres",
                },
              })}
            />
          </div>

          {/* Campo numero 4 del Formulario PASSWORD*/}
          <div className="relative">
            <LuLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type={showPassword ? "text" : "password"}
              className={`appearance-none rounded-lg block w-full pl-10 pr-3 py-2 border ${
                errors.name ? "border-red-500" : "border-gray-300"
              } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition duration-200`}
              placeholder="Password"
              {...register("password_usr", {
                required: {
                  value: true,
                  message: "campo requerido",
                },
                minLength: {
                  value: 6,
                  message: "La contraseña debe tener minimo 6 digitos",
                },
              })}
            />
            {/* Boton para mostrar contraseña */}
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <AiOutlineEyeInvisible className="h-5 w-5 text-gray-400" />
              ) : (
                <AiOutlineEye className="h-5 w-5 text-gray-400" />
              )}
            </button>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 disabled:opacity-50"
            >
              {loading ? (
                <FaSpinner className="animate-spin h-5 w-5" />
              ) : (
                <span>{isLogin ? "Iniciar Sesion" : "Crear Cuenta"}</span>
              )}
            </button>
          </div>

          <div>
            <Link
              href="/"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 disabled:opacity-50"
            >
              Home
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthComponent;
