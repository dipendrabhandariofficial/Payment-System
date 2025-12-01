import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { useLocation } from "react-router-dom";

export type RouteContextType = {
  currentPath: string;
  previousPath: string | null;
  navigateTo: (path: string) => void;
  goBack: () => void;
};

interface RouteProviderProps {
  children: ReactNode;
}

const RouteContext = createContext<RouteContextType | undefined>(undefined);

export const RouteProvider: React.FC<RouteProviderProps> = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    const current = location.pathname;
    const prev = sessionStorage.getItem("prevPath");
    if (current !== prev) {
      sessionStorage.setItem("prevPath", current);
    }
  }, [location.pathname]);

  const value: RouteContextType = {
    currentPath: location.pathname,
    previousPath: sessionStorage.getItem("prevPath") || null,
    navigateTo: (path: string) => window.location.pathname = path,
    goBack: () => window.history.back(),
  };

  return (
    <RouteContext.Provider value={value}>
      {children}
    </RouteContext.Provider>
  );
};

export const useRoute = (): RouteContextType => {
  const context = useContext(RouteContext);
  if (!context) {
    throw new Error("useRoute must be used within RouteProvider");
  }
  return context;
};

export const usePrevPath = (): string | null => {
  return sessionStorage.getItem("prevPath");
};
