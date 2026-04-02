import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, token } = useSelector((state) => state.users);

  const isAuthenticated = !!token && !!user;

  if (!isAuthenticated) {
    return <Navigate to={adminOnly ? "/admin/login" : "/login"} replace />;
  }

  if (adminOnly && user?.role !== "admin") {
    return <Navigate to="/user-dashboard" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;