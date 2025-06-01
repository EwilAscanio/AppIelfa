"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  FaChurch,
  FaBars,
  FaTimes,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaPray,
  FaCalendarAlt,
  FaHandHoldingHeart,
} from "react-icons/fa";
import JovenesReunion from "../../public/images/reunionjovenes.jpg"

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { title: "Home", href: "#home" },
    { title: "About", href: "/auth/dashboard" },
    { title: "Services", href: "#services" },
    { title: "Events", href: "#events" },
    { title: "Contact", href: "#contact" },
  ];

  

  const events = [
    {
      title: "Servicio Dominical",
      time: "Domingo 9:30 AM - 12:00 M",
      description: "Únete a nuestro servicio de adoración semanal",
      image: "/images/reuniondominical.jpg",
    },
    {
      title: "Estudio Bíblico",
      time: "Miércoles 6:30 PM",
      description: "Enriquecimiento espiritual a mitad de semana",
      image: "/images/estudiobiblico.jpg",
    },
    {
      title: "Grupo de Jóvenes",
      time: "Viernes 7:00 PM",
      description: "Actividades para jóvenes",
      image: "/images/reunionjovenes.jpg",
    },
    {
      title: "Reunión de Oración",
      time: "Martes 7:00 PM",
      description: "Tiempo de oración y reflexión",
      image: "/images/martesoracion.jpg",
    },
  ];

  const Background = "../images/oracion.jpg";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          isScrolled ? "bg-white shadow-lg" : "bg-transparent"
        }}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <FaChurch className="text-purple-600 text-3xl" />
              <span className="ml-2 text-xl font-bold text-purple-600">
                Iglesia Evangelica Libre Flor Amarilla
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navLinks.map((link) => (
                  <a
                    key={link.title}
                    href={link.href}
                    className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                    aria-label={`Navigate to ${link.title}`}
                  >
                    {link.title}
                  </a>
                ))}
                <button
                  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors duration-200"
                  aria-label="Login to your account"
                >
                  Login
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-purple-600 focus:outline-none"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <a
                  key={link.title}
                  href={link.href}
                  className="block text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-base font-medium"
                >
                  {link.title}
                </a>
              ))}
              <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors duration-200">
                Login
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div
        className="relative h-screen flex items-center justify-center"
        style={{
          backgroundImage: `url("/images/oracion.jpg")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Bienvenido a Ielfa
          </h1>
          <p className="text-xl md:text-2xl mb-8">
            Únete a nuestra comunidad de fe, esperanza y amor
          </p>
          <Link
            href="/login"
            className="bg-purple-600 text-white px-8 py-3 rounded-md text-lg hover:bg-purple-700 transition-colors duration-200 shadow-lg"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>

      {/* Events Section */}
      <section id="events" className="py-20 px-4 bg-gray-100">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Próximos Eventos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {events.map((event) => (
              <div
                key={event.title}
                className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-200"
              >
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-48 object-cover"
                  loading="lazy"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                  <p className="text-purple-600 mb-2">{event.time}</p>
                  <p className="text-gray-600">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Our Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-gray-50 rounded-lg hover:shadow-lg transition-shadow duration-200">
              <FaPray className="w-12 h-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Worship Services</h3>
              <p className="text-gray-600">
                Join us for inspiring worship and meaningful messages.
              </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg hover:shadow-lg transition-shadow duration-200">
              <FaCalendarAlt className="w-12 h-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Community Events</h3>
              <p className="text-gray-600">
                Participate in various community gatherings and activities.
              </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg hover:shadow-lg transition-shadow duration-200">
              <FaHandHoldingHeart className="w-12 h-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Outreach Programs</h3>
              <p className="text-gray-600">
                Make a difference in our community through various outreach
                initiatives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Iglesia Ielfa</h3>
              <p className="text-gray-400">
                Calle de la Fe 123
                <br />
                Ciudad Santa, CS 12345
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Contacto</h3>
              <p className="text-gray-400">
                Teléfono: (555) 123-4567
                <br />
                Email: info@ielfa.com
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Síguenos</h3>
              <div className="flex space-x-4">
                <FaFacebook className="text-2xl hover:text-purple-500 cursor-pointer" />
                <FaTwitter className="text-2xl hover:text-purple-500 cursor-pointer" />
                <FaInstagram className="text-2xl hover:text-purple-500 cursor-pointer" />
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-400">
              &copy; 2025 Iglesia Ielfa. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
