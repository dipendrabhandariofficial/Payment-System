import {
  LayoutDashboard,
  Users,
  DollarSign,
  FileText,
  Plus,
  BookOpen,
  Banknote,
  X,
  ChevronLeft,
  ChevronRight,
  Settings,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { NavLink } from "react-router-dom";

const Sidebar = ({ open, onClose, isCollapsed, toggleCollapse }) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const menuItems = [
    { name: t("sidebar.dashboard"), path: "/dashboard", icon: LayoutDashboard },
    { name: t("sidebar.students"), path: "/students", icon: Users },
    { name: t("sidebar.courses"), path: "/courses", icon: BookOpen },
    { name: t("sidebar.payments"), path: "/payments", icon: DollarSign },
    { name: t("sidebar.addpayment"), path: "/add-payment", icon: Plus },
    { name: t("sidebar.duepayments"), path: "/due-payments", icon: Banknote },
    { name: t("sidebar.reports"), path: "/reports", icon: FileText },
  ];

  if (user?.role === "admin") {
    menuItems.push({
      name: "Settings", // TODO: Add translation key 'sidebar.settings'
      path: "/settings",
      icon: Settings,
    });
  }

  return (
    <>
      {/* Overlay for mobile - only visible when sidebar is open */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 sm:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed sm:static inset-y-0 left-0 z-50
          ${isCollapsed ? "w-20" : "w-64"} 
          bg-white dark:bg-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-800
          transform transition-all duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full sm:translate-x-0"}
          flex flex-col shadow-xl sm:shadow-none
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
        <div className="p-4 flex-1 overflow-y-auto overflow-x-hidden">
          <nav className="space-y-2 text-gray-900 dark:text-gray-100">
            {menuItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={onClose}
                title={isCollapsed ? item.name : ""}
                className={({ isActive }) =>
                  `flex items-center ${
                    isCollapsed ? "justify-center px-2" : "space-x-3 px-4"
                  } py-3 rounded-lg transition-all duration-200 group relative ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                  }`
                }
              >
                <item.icon
                  className={`w-5 h-5 shrink-0 ${isCollapsed ? "" : ""}`}
                />
                <span
                  className={`whitespace-nowrap transition-all duration-300 ${
                    isCollapsed
                      ? "w-0 opacity-0 overflow-hidden"
                      : "w-auto opacity-100"
                  }`}
                >
                  {item.name}
                </span>

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                    {item.name}
                  </div>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer: User Profile + Collapse Toggle */}
        <div className="hidden sm:flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-800">
          {/* User Profile */}
          <div
            className={`flex items-center ${
              isCollapsed ? "justify-center w-full" : "gap-3 overflow-hidden"
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center shrink-0">
              <span className="text-sm font-medium text-blue-600 dark:text-blue-300">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>

            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {user?.name || "User"}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email || "user@example.com"}
                </span>
              </div>
            )}
          </div>

          {/* Collapse Button */}
          {!isCollapsed && (
            <button
              onClick={toggleCollapse}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors shrink-0 ml-2"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Collapsed State Toggle (Floating button) */}
          {isCollapsed && (
            <button
              onClick={toggleCollapse}
              className="absolute -right-3 top-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-1 shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors z-50"
            >
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
