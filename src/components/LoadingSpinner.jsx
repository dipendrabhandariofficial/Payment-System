import React from "react";
import { Loader2 } from "lucide-react";

const LoadingSpinner = ({ message = "Loading...", size = "w-12 h-12" }) => {
  return (
    <div className="flex items-center justify-center  bg-gray-50">
      <div className="text-center">
        <Loader2 className={`${size} text-gray-600 animate-spin mx-auto mb-4`} />
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;

