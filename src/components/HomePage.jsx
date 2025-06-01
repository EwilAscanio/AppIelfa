// pages/index.js
import Link from "next/link";
import Image from "next/image";

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen bg-purple-50 relative overflow-hidden">
      {/* Contenedor de fondo con imagen y overlay */}
      <div className="fixed inset-0 -z-10">
        <Image
          src="https://e0.pxfuel.com/wallpapers/194/109/desktop-wallpaper-musician-love-group-singer-worshipper-hands-up-concert-music-png-christian-hillsong-orange-adoration-guitar-lights-crowd-live-music-church-audience-band-people.jpg"
          alt="Fondo de la Iglesia"
          layout="fill"
          objectFit="cover"
          className="opacity-50"
        />
        <div className="absolute inset-0 bg-black opacity-50"></div>
      </div>

      <header className="relative z-10 w-full p-4 bg-white shadow-md">
        <div className="flex justify-between items-center container mx-auto">
          <Image
            src="https://via.placeholder.com/150.png?text=Logo"
            alt="Logo de la Iglesia"
            width={150}
            height={50}
            className="w-32"
          />
          <nav className="space-x-4">
            {["/", "/about", "/events", "/contact"].map((path, index) => (
              <Link key={index} href={path}>
                <button className="text-purple-600 hover:underline">
                  {path === "/"
                    ? "Inicio"
                    : path.slice(1).charAt(0).toUpperCase() + path.slice(2)}
                </button>
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex flex-col items-center justify-center flex-grow relative z-10 text-center">
        <h1 className="text-6xl font-extrabold text-purple-800 mb-4">
          Iglesia de la Comunidad
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Un lugar para crecer en fe y comunidad.
        </p>
        <Link href="/login">
          <button className="bg-purple-600 text-white px-8 py-4 rounded-full shadow-lg transition-transform transform hover:scale-105 hover:bg-purple-700 duration-300">
            Iniciar Sesión
          </button>
        </Link>
      </main>

      <footer className="bg-white shadow-md text-gray-500 p-4 relative z-10">
        <div className="container mx-auto text-center">
          <p>
            &copy; {new Date().getFullYear()} Iglesia de la Comunidad. Todos los
            derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
