import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectUser } from "../redux/userSlice";
import type { AppDispatch } from "../redux/store";
import {
  createPlaylist, deletePlaylist, loadForUser, selectPlaylists, updatePlaylistName,
} from "../redux/playlistSlice";
import "./Playlists.css";

// Página de listagem/CRUD de playlists do usuário logado
export default function Playlists() {
  const user = useSelector(selectUser)!;
  const playlists = useSelector(selectPlaylists).filter(p => p.usuarioId === user.id);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Estado local para criar/renomear
  const [nome, setNome] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [novoNome, setNovoNome] = useState("");

  // Carrega playlists do usuário ao montar
  useEffect(() => {
    dispatch(loadForUser({ usuarioId: user.id }));
  }, [dispatch, user.id]);

  // Handler de criação de playlist
  function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) return;
    dispatch(createPlaylist({ usuarioId: user.id, nome: nome.trim() }));
    setNome("");
  }

  return (
    <div className="playlists-wrap">
      <h1>Minhas Playlists</h1>

      {/* Form de criação */}
      <form className="playlist-form" onSubmit={onCreate}>
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome da playlist"
          aria-label="Nome da playlist"
        />
        <button type="submit" className="btn primary">Criar</button>
      </form>

      {/* Lista de playlists com ações */}
      <ul className="playlist-list">
        {playlists.map((p) => (
          <li key={p.id} className="playlist-item">
            {editId === p.id ? (
              // Modo edição de nome
              <div className="edit-row">
                <input
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  placeholder="Novo nome"
                  aria-label="Novo nome da playlist"
                />
                <div className="playlist-actions">
                  <button
                    className="btn primary"
                    onClick={() => {
                      if (!novoNome.trim()) return;
                      dispatch(updatePlaylistName({ usuarioId: user.id, id: p.id, nome: novoNome.trim() }));
                      setEditId(null);
                    }}
                  >
                    Salvar
                  </button>
                  <button className="btn ghost" onClick={() => setEditId(null)}>
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="playlist-info">
                  <strong>{p.nome}</strong>
                  <span className="muted"> &nbsp;• {p.musicas.length} música(s)</span>
                </div>
                <div className="playlist-actions">
                  <button
                    className="btn ghost"
                    onClick={() => {
                      setEditId(p.id);
                      setNovoNome(p.nome);
                    }}
                  >
                    Renomear
                  </button>
                  <button className="btn ghost" onClick={() => navigate(`/playlists/${p.id}`)}>
                    Gerenciar
                  </button>
                  <button
                    className="btn danger"
                    onClick={() => dispatch(deletePlaylist({ usuarioId: user.id, id: p.id }))}
                  >
                    Excluir
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
