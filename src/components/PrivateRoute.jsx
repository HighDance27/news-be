import { Navigate, useLocation } from "react-router-dom";

function PrivateRoute({ children, allowedRoles = [] }) {
  const token = localStorage.getItem("access_token");
  const role = localStorage.getItem("role");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (allowedRoles.length === 0) {
    return children;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default PrivateRoute;
