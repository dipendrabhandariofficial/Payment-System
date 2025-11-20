import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  DollarSign,
  FileText,
  Plus,
  BookOpen,
  Banknote,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const Sidebar = ({ open, onClose }) => {
  const { t } = useTranslation();
  
  const menuItems = [
    { name: t("sidebar.dashboard"), path: "/dashboard", icon: LayoutDashboard },
    { name: t("sidebar.students"), path: "/students", icon: Users },
    { name: t("sidebar.courses"), path: "/courses", icon: BookOpen },
    { name: t("sidebar.payments"), path: "/payments", icon: DollarSign },
    { name: t("sidebar.addpayment"), path: "/add-payment", icon: Plus },
    { name: t("sidebar.duepayments"), path: "/due-payments", icon: Banknote },
    { name: t("sidebar.reports"), path: "/reports", icon: FileText },
  ];

  return (
    <>
      {/* Overlay for mobile - only visible when sidebar is open */}
      {open && (
        <div
          className="fixed inset-0  bg-opacity-50 z-40 sm:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
      
        className={`
          fixed sm:static inset-y-0 left-0 z-50
          w-64 bg-gray-100 dark:bg-gray-900 dark:text-gray-100
          transform transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'}
          flex flex-col
        `}
      >
        {/* Close button for mobile */}
        <div className="sm:hidden flex justify-end p-4">
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <div className="p-4 flex-1 overflow-y-auto">
          <nav className="space-y-2 text-gray-900 dark:text-gray-100">
            {menuItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-300 dark:hover:bg-gray-800"
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;