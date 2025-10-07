import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "../redux/userSlice";

// Protege rotas: só permite acesso se o usuário estiver logado
export default function PrivateRoute({ children }: { children: ReactNode }) {
  const authed = useSelector(selectIsAuthenticated);
  // Se autenticado, renderiza o conteúdo; senão, redireciona pro login
  return authed ? children : <Navigate to="/login" replace />;
}
