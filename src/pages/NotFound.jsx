import React from "react";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-gray-100 text-center mt-[-3rem]">
      <h1 className="text-9xl font-extrabold text-green-600 mb-6">404</h1>
      <p className="text-2xl text-gray-700 mb-10">
        Oops! The page you're looking for doesn't exist.
      </p>
      <Link to="/">
        <button className="px-8 py-3 bg-green-500 text-white text-lg rounded hover:bg-green-600 shadow-lg transition duration-200">
          Go Back Home
        </button>
      </Link>
    </div>
  );
}

export default NotFound;
