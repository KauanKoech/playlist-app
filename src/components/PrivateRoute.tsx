import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "../redux/userSlice";

export default function PrivateRoute({ children }: { children: ReactNode }) {
  const authed = useSelector(selectIsAuthenticated);
  return authed ? children : <Navigate to="/login" replace />;
}
