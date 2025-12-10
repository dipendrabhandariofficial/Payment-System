import React from "react";
import { useAuth } from "../context/AuthContext";

const Settings: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
        Settings
      </h1>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-200">
            Application Settings
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Welcome, {user?.name}. You have access to this page because you are
            an {user?.role}.
          </p>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          {/* Dummy Settings Controls */}
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-700 dark:text-gray-300">
              Allow New Registrations
            </span>
            <label className="inline-flex relative items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked
                readOnly
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-700 dark:text-gray-300">
              Maintenance Mode
            </span>
            <label className="inline-flex relative items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
