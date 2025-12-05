import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft, Search } from "lucide-react";
import { Button } from "@dipendrabhandari/react-ui-library";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Animation */}
        <div className="relative mb-8">
          <div className="text-[180px] font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 leading-none animate-pulse">
            404
          </div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Search className="w-24 h-24 text-gray-300 animate-bounce" />
          </div>
        </div>

        {/* Message */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Page Not Found
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Oops! The page you're looking for doesn't exist.
          </p>
          <p className="text-gray-500">
            It might have been moved or deleted, or you may have mistyped the
            URL.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={() => navigate(-1)}
            leftIcon={<ArrowLeft className="w-5 h-5" />}
            colorScheme="gray"
            className="transition-all hover:scale-105"
          >
            Go Back
          </Button>
          <Button
            onClick={() => navigate("/dashboard")}
            colorScheme="blue"
            rightIcon={<Home className="w-5 h-5" />}
            className="transition-all hover:scale-105"
          >
            Go to Dashboard
          </Button>
        </div>

        {/* Decorative Elements */}
        <div className="mt-16 grid grid-cols-3 gap-4 opacity-30">
          <div className="h-2 bg-linear-to-r from-blue-400 to-blue-600 rounded-full animate-pulse"></div>
          <div className="h-2 bg-linear-to-r from-purple-400 to-purple-600 rounded-full animate-pulse delay-100"></div>
          <div className="h-2 bg-linear-to-r from-pink-400 to-pink-600 rounded-full animate-pulse delay-200"></div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
