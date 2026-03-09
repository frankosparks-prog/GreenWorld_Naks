// import React from 'react';
// import { Navigate } from 'react-router-dom';

// const ProtectedRoute = ({ children }) => {
//   const token = localStorage.getItem('adminToken');
//   console.log('adminToken:', token); // Check if token is retrieved

//   if (!token) {
//     console.log('Redirecting to admin login');
//     return <Navigate to="/ultra/admin" />;
//   }

//   console.log('Access granted');
//   return children;
// };


// export default ProtectedRoute;
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token || !user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
