import React, { createContext, useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";

const RouteContext = createContext();

export const RouteProvider = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    // Save the previous path in sessionStorage
    const current = location.pathname;
    const prev = sessionStorage.getItem("prevPath");
    if (current !== prev) {
      sessionStorage.setItem("prevPath", current);
    }
  }, [location.pathname]);

  return <RouteContext.Provider value={{}}>{children}</RouteContext.Provider>;
};

export const usePrevPath = () => {
  const prevPath = sessionStorage.getItem("prevPath");
  return prevPath;
};