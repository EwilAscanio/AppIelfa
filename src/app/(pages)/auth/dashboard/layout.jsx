"use client";

import { useState } from "react";
import NavbarDasboard from "@/components/NavbarDasboard";
import Sidebar from "@/components/Sidebar";


const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState(3);
  const [messages, setMessages] = useState(5);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isSidebarOpen={isSidebarOpen} />
      <main className="flex-1 overflow-x-hidden overflow-y-auto">
        <NavbarDasboard
          toggleSidebar={toggleSidebar}
          messages={messages}
          notifications={notifications}
        />
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
