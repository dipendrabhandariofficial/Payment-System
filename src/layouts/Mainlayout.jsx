// src/layouts/MainLayout.jsx
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const MainLayout = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      className={`flex flex-col h-screen overflow-hidden ${
        darkMode ? "dark bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* Navbar (fixed at top) */}
      <Navbar
        darkMode={darkMode}
        toggleDarkMode={() => setDarkMode((v) => !v)}
        toggleSidebar={() => setSidebarOpen((v) => !v)}
      />

      {/* Main Container (fills rest of screen) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (fixed height, scrollable if needed) */}
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Content Area (only this scrolls) */}
        <main className="flex-1 overflow-y-auto p-6 transition-all duration-300 ease-in-out *:">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
