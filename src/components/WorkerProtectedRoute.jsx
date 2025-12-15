import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const WorkerProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("workerToken");
  const location = useLocation();

  // If trying to access worker dashboard without login
  if (!token && location.pathname === "/worker/dashboard") {
    return <Navigate to="/workerlogin" replace />;
  }

  // Optional: protect all worker routes
  if (!token) {
    return <Navigate to="/workerlogin" replace />;
  }

  return children;
};

export default WorkerProtectedRoute;
