import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute() {
  const token =
    localStorage.getItem("travexaToken") || localStorage.getItem("token");
  const isLoggedIn =
    localStorage.getItem("travexaLoggedIn") === "true" && Boolean(token);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
