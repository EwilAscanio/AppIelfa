import { FiMenu, FiMail, FiBell } from "react-icons/fi";
import { useState, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import LinkSignout from "./LinkSignout";


const NavbarDashboard =  ({ toggleSidebar, messages, notifications }) => {

  const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
  
    useEffect(() => {
      const fetchUserSession = async () => {
        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/api/usersesion`);

          const { user, role } = response.data;
          setUser(user);
          setRole(role);
        } catch (error) {
          console.error("Error fetching user session:", error);
        }
      };
  
      fetchUserSession();
    }, []);

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
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            alt="Profile"
            className="w-10 h-10 rounded-full"
          />
          <div className="ml-3">
            <p className="font-semibold text-gray-800">{user || "Cargando..."}</p>
            <p className="text-sm text-gray-500">{role || "Cargando..."}</p>
          </div>
        </div>

        <div className="lex items-center space-x-4">

          <LinkSignout />
        </div>

      {/*}
        <div className="flex items-center space-x-4">
          <button className="relative p-2 rounded-full hover:bg-gray-100">
            <FiMail className="w-6 h-6 text-gray-600" />
            <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs text-white bg-red-500 rounded-full">
              {messages}
            </span>
          </button>
          <button className="relative p-2 rounded-full hover:bg-gray-100">
            <FiBell className="w-6 h-6 text-gray-600" />
            <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs text-white bg-red-500 rounded-full">
              {notifications}
            </span>
          </button>
        </div>*/}
      </div>
    </header>
  );
};

NavbarDashboard.propTypes = {
  toggleSidebar: PropTypes.func.isRequired,
  messages: PropTypes.number.isRequired,
  notifications: PropTypes.number.isRequired,
  user: PropTypes.shape({
    name: PropTypes.string,
    role: PropTypes.string,
  }),
};

export default NavbarDashboard;
