import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../../hooks/useAuthStore";
import Layout from "../../components/Layout/Layout";

const ProtectedRoute = () => {
  const { isLoggedIn, role } = useAuthStore();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (String(role).toLowerCase() !== "parent") return <Navigate to="/login" replace />;
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

export default ProtectedRoute;
