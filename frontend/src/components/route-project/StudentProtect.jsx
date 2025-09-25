import React from "react";
import { Navigate } from "react-router-dom";

const StudentProtectedRoute = ({ children }) => {
  const username = sessionStorage.getItem("username");

  if (!username || username.startsWith("teacher")) {
    // Redirect to login if no username OR if it's a teacher
    return <Navigate to="/" replace />;
  }

  return children;
};

export default StudentProtectedRoute;
