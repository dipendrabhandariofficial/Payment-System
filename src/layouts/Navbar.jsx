import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  User,
  Settings,
  ChevronDown,
  School,
  Sun,
  Moon,
  Menu,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const Navbar = ({ darkMode, toggleDarkMode, toggleSidebar }) => {
  // ...existing code...
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { i18n } = useTranslation();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
    setShowUserMenu(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowUserMenu(false);
    };

    if (showUserMenu) {
      // Add a small delay to avoid immediate closing
      setTimeout(() => {
        document.addEventListener("click", handleClickOutside);
      }, 100);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showUserMenu]);

  const handleToggleSidebar = () => {
    if (typeof toggleSidebar === "function") toggleSidebar();
  };

  return (
    <nav className="bg-gray-300 border-gray-200 shadow-sm dark:bg-gray-900 dark:text-gray-100">
      <div className="px-6">
        <div className="flex justify-between items-center h-16">

          {/* LEFT — Burger (mobile) + Logo + Title */}
          <div className="flex items-center gap-3">
            {/* Burger button - visible on small screens only */}
            <button
              onClick={handleToggleSidebar}
              aria-label="Toggle sidebar"
              className="sm:hidden p-2  rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Menu className="w-6 h-6 text-gray-700 dark:text-gray-200" />
            </button>

            <div className="bg-gray-800 rounded-lg p-2">
              <School className="w-6 h-6 text-white" />
            </div>

            {/* Title - hidden on small screens, only show on sm+ */}
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Fee Management System
              </h1>
              <p className="text-xs text-gray-500">
                School Administration
              </p>
            </div>
          </div>

          {/* RIGHT — Language + Dark Mode + User */}
          <div className="flex items-center gap-6 ml-2">
            {/* Language Switch */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
              <button
                onClick={() => changeLanguage("en")}
                className={`px-3 py-1 text-sm font-medium transition ${
                  i18n.language === "en"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => changeLanguage("np")}
                className={`px-3 py-1 text-sm font-medium transition ${
                  i18n.language === "np"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              >
                NP
              </button>
            </div>

            {/* Dark Mode Toggle */}
            <button className="icon-btn themeicon" onClick={toggleDarkMode}>
              {darkMode ? (
                <Sun size={20} className="text-amber-300" />
              ) : (
                <Moon size={20} className="text-gray-900" />
              )}
            </button>

            {/* User Profile */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUserMenu(!showUserMenu);
                }}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {user?.name}
                  </span>
                  <span className="text-xs text-gray-500">{user?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-700" />
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-600 transition-transform ${
                      showUserMenu ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>

              {showUserMenu && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 py-1 z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-4 py-3 border-b">
                    <p className="text-sm font-semibold text-amber-400 dark:text-gray-200">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => setShowUserMenu(false)}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
