import { Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Playlists from "./pages/Playlists";
import Musicas from "./pages/Musicas";
import PrivateRoute from "./components/PrivateRoute";
import PlaylistManage from "./pages/PlaylistManage";

export default function App() {
  return (
    <>
      <nav className="navbar">
        <Link to="/home">Home</Link>
        <Link to="/playlists">Playlists</Link>
        <Link to="/musicas">Músicas</Link>
      </nav>

      <Routes>
        <Route path="/login" element={<Login />} />
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
        <Route path="*" element={<Login />} />
      </Routes>
    </>
  );
}
