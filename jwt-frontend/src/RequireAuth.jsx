import { useLocation, Navigate, Outlet } from "react-router-dom";
import useAuth from "./hooks/useAuth";

const LOGIN_URL = "/";
const UNAUTHORIZED_URL = "/unauthorized";

const RequireAuth = ({ allowedRole }) => {
  const { auth } = useAuth();
  const location = useLocation();

  // If there are multiple allowes roles and an allowedRoles array has been passed
  // down as a prop

  // return auth?.roles?.find((role) => allowedRoles?.includes(role)) ? (
  //   <Outlet />
  // ) : auth?.name ? (
  //   <Navigate to="/unauthorized" state={{ from: location }} replace />
  // ) : (
  //   <Navigate to="/" state={{ from: location }} replace />
  // );

  return allowedRole === "admin" && auth?.admin === 1 ? (
    <Outlet />
  ) : allowedRole === "admin" && auth?.admin === 0 ? (
    <Navigate to={UNAUTHORIZED_URL} state={{ from: location }} replace />
  ) : allowedRole === "user" && auth?.name ? (
    <Outlet />
  ) : (
    <Navigate to={LOGIN_URL} state={{ from: location }} replace />
  );
};

export default RequireAuth;
