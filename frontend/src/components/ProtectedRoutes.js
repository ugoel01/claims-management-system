import React from "react";
import { Navigate, Outlet } from "react-router-dom";
 
const ProtectedRoutes = () => {
  // Check if the user is logged in by checking the token in localStorage
  const token = localStorage.getItem("token");
 
  // If there is no token, redirect to the login page
  if (!token) {
    return <Navigate to="/login" />;
  }
 
  // If the token exists, allow access to the child routes
  return <Outlet />;
};
 
export default ProtectedRoutes;