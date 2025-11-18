import React from 'react';
export default function Loader() {
  return (
    <div className="flex justify-center items-center h-screen text-gray-500">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-500"></div>
    </div>
  );
}
