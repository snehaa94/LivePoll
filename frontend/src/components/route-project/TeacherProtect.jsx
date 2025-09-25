import React from "react";
import { Navigate } from "react-router-dom";

const TeacherProtectedRoute = ({ children }) => {
  const username = sessionStorage.getItem("username");

  if (!username || !username.startsWith("teacher")) {
    // Redirect to login if not logged in OR not a teacher
    return <Navigate to="/" replace />;
  }

  return children;
};

export default TeacherProtectedRoute;
