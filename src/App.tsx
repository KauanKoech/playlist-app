// Importa rotas e componentes principais
import { Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Playlists from "./pages/Playlists";
import Musicas from "./pages/Musicas";
import PrivateRoute from "./components/PrivateRoute";
import PlaylistManage from "./pages/PlaylistManage";

// Componente principal que define a estrutura de rotas e navegação
export default function App() {
  return (
    <>
      {/* Barra de navegação simples */}
      <nav className="navbar">
        <Link to="/home">Home</Link>
        <Link to="/playlists">Playlists</Link>
        <Link to="/musicas">Músicas</Link>
      </nav>

      {/* Definição das rotas principais */}
      <Routes>
        {/* Página de login */}
        <Route path="/login" element={<Login />} />

        {/* Rotas protegidas por autenticação */}
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/playlists/:id"
          element={
            <PrivateRoute>
              <PlaylistManage />
            </PrivateRoute>
          }
        />
        <Route
          path="/playlists"
          element={
            <PrivateRoute>
              <Playlists />
            </PrivateRoute>
          }
        />
        <Route
          path="/musicas"
          element={
            <PrivateRoute>
              <Musicas />
            </PrivateRoute>
          }
        />

        {/* Rota padrão: redireciona para Login */}
        <Route path="*" element={<Login />} />
      </Routes>
    </>
  );
}
