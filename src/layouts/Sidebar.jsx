import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, DollarSign, FileText, Plus } from 'lucide-react';
import { useTranslation } from "react-i18next";

const Sidebar = () => {
  const { t } = useTranslation();
  const menuItems = [
    { name: t("sidebar.dashboard"), path: '/dashboard', icon: LayoutDashboard },
    { name: t("sidebar.students"), path: '/students', icon: Users },
    { name: t("sidebar.payments"), path: '/payments', icon: DollarSign },
    { name: t("sidebar.addpayment"), path: '/add-payment', icon: Plus },
    { name: t("sidebar.reports"), path: '/reports', icon: FileText },
  ];

  return (
    <aside className="w-64 bg-gray-800 ">
      <div className="p-4">
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
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
  );
};

export default Sidebar;