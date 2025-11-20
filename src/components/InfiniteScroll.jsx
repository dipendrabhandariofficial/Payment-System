import React from "react";

const InfiniteScroll = ({ children, loaderRef, hasMore }) => {
  return (
    <>
      {children}
      {hasMore && (
        console.log("More"),
        
        <div ref={loaderRef} className="flex justify-center py-8">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          </div>
        </div>
      )}
    </>
  );
};

export default InfiniteScroll;