import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { logout, selectUser } from "../redux/userSlice";
import { selectPlaylists } from "../redux/playlistSlice";
import type { AppDispatch } from "../redux/store";
import "./Home.css";

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const playlists = useSelector(selectPlaylists).filter(p => p.usuarioId === user?.id);

  const stats = useMemo(() => {
    const totalMusicas = playlists.reduce((acc, p) => acc + p.musicas.length, 0);
    return {
      totalPlaylists: playlists.length,
      totalMusicas,
      ultimas: playlists.slice(-3).reverse(),
    };
  }, [playlists]);

  return (
    <div className="home-wrap">
      {/* HERO */}
      <header className="home-hero">
        <div>
          <h1>Schmidtunes</h1>
          <p className="muted">
            Olá {user?.email?.split("@")[0] || "usuário"}!
            {user?.lastLogin && (
              <> Último login: <strong>{new Date(user.lastLogin).toLocaleString()}</strong></>
            )}
          </p>
        </div>
        <button className="ghost" onClick={() => dispatch(logout())}>Sair</button>
      </header>

      {/* AÇÕES RÁPIDAS */}
      <section className="quick-grid">
        <button className="quick-card" onClick={() => navigate("/playlists")}>
          <span className="emoji">💿</span>
          <div>
            <h3>Criar Playlist</h3>
            <p className="muted">Organize suas faixas favoritas.</p>
          </div>
        </button>

        <button className="quick-card" onClick={() => navigate("/musicas")}>
          <span className="emoji">🔎</span>
          <div>
            <h3>Buscar Músicas</h3>
            <p className="muted">Encontre faixas pelo título ou artista.</p>
          </div>
        </button>
      </section>

      {/* RESUMO / METRICAS */}
      <section className="stats-grid">
        <div className="stat">
          <span className="label">Playlists</span>
          <span className="value">{stats.totalPlaylists}</span>
        </div>
        <div className="stat">
          <span className="label">Músicas</span>
          <span className="value">{stats.totalMusicas}</span>
        </div>
        {/* espaço para futura métrica (ex.: última playlist acessada) */}
        <div className="stat">
          <span className="label">Sessão</span>
          <span className="value">{user?.email ? "Ativa" : "—"}</span>
        </div>
      </section>

      {/* LISTA RÁPIDA */}
      <section className="list-block">
        <div className="list-header">
          <h3>Últimas playlists</h3>
          <Link to="/playlists" className="small-link">ver todas →</Link>
        </div>
        {stats.ultimas.length === 0 ? (
          <p className="muted">Você ainda não tem playlists. Comece criando uma!</p>
        ) : (
          <ul className="plist">
            {stats.ultimas.map(p => (
              <li key={p.id} className="plist-item">
                <div>
                  <strong>{p.nome}</strong>
                  <span className="muted"> &nbsp;• {p.musicas.length} música(s)</span>
                </div>
                <button className="ghost small" onClick={() => navigate("/playlists")}>abrir</button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
