'use client';

import { useState } from "react";
import { RiLockLine, RiUserLine, RiSparklingLine, RiEyeLine, RiEyeOffLine } from "react-icons/ri";
import { FaSpinner } from "react-icons/fa";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Link from "next/link";

const LoginCard = () => {
  const [showPassword, setShowPassword] = useState(false);

    const [error, setError] = useState(null);
    const router = useRouter();
  
    const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm();
  
    const [loading, setLoading] = useState(false);
  
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
          setLoading(true);
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 2000));
          setLoading(false);
    
          router.push( `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/auth/dashboard`);
          router.refresh();
        }
      });

  return (
    // Fondo de página con degradado oscuro
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-900 to-indigo-800"> 
      <div className="w-full max-w-5xl">
        <div className="grid lg:grid-cols-2 gap-0 bg-white rounded-2xl overflow-hidden shadow-2xl">
          
          {/* Lado Izquierdo: Formulario */}
          <div className="p-10 md:p-14 flex flex-col justify-center">
            
            {/* Encabezado */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-3 mb-3">
                <RiSparklingLine className="h-9 w-9 text-purple-600" /> 
                <h2 className="text-4xl font-extralight bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-800">
                  Bienvenido
                </h2>
              </div>
              <p className="text-gray-500 text-lg">
                Accede a tu cuenta para continuar
              </p>
            </div>

            {/* Formulario */}
            <form className="space-y-6" onSubmit={onSubmit}>
              
              {/* Campo de Usuario */}
              <div className="space-y-2">
                <label htmlFor="username" className="text-base font-medium text-gray-700">
                  Usuario
                </label>
                <div className="relative">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-full flex items-center justify-center pointer-events-none">
                    <RiUserLine className="h-5 w-5 text-purple-500" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    placeholder="Escribe tu usuario"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all text-base text-gray-700 focus:outline-none"
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
              </div>

              {/* Campo de Contraseña */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-base font-medium text-gray-700">
                  Contraseña
                </label>
                <div className="relative">
                  <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-12 h-full flex items-center justify-center pointer-events-none ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}>
                    <RiLockLine className="h-5 w-5 text-purple-500" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Contraseña segura"
                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all text-base text-gray-700 focus:outline-none"
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
                  {/* Botón de mostrar/ocultar contraseña */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-full flex items-center justify-center text-gray-400 hover:text-purple-600 transition-colors"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? (
                      <RiEyeOffLine className="h-5 w-5" />
                    ) : (
                      <RiEyeLine className="h-5 w-5" />
                    )}
                  </button>
                  {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
                </div>
              </div>

              {/* Botón de Iniciar Sesión */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 text-lg font-bold text-white rounded-xl bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/50
                             hover:shadow-xl hover:shadow-purple-500/60 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center"
                >
                  {loading ? (
                    <FaSpinner className="animate-spin h-5 w-5" />
                  ) : (
                    "Iniciar Sesión"
                  )}
                </button>
              </div>
            </form>

            
          </div>

          {/* Lado Derecho: Imagen y Branding */}
          <div className="hidden lg:block relative overflow-hidden rounded-r-2xl">
            {/* Contenedor de Imagen de Fondo */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ 
                backgroundImage: `url('/images/imagenlogin.jpg')`, 
              }}
            ></div>
            
            {/* ✨ CAMBIO 1: Superposición de degradado más vivo para la imagen */}
            <div
              className="absolute inset-0 bg-gradient-to-tr from-purple-400/70 via-purple-400/70 to-purple-600/70"
            />
            
            {/* Texto Central */}
            <div className="relative h-full flex items-center justify-center p-12">
              {/* ✨ CAMBIO 2: Texto en color blanco */}
              <div className="text-center text-white">
                <h3 className="text-4xl font-extrabold mb-4 leading-snug text-purple-700 animate-pulse">
                  IELFA
                </h3>
                <p className="text-xl opacity-90 shadow-lg shadow-purple-500/50 ">
                  App para la Gestión de Asistencias a Eventos
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginCard;
