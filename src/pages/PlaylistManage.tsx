import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectUser } from "../redux/userSlice";
import { addMusic, removeMusic, selectPlaylists, loadForUser } from "../redux/playlistSlice";
import type { AppDispatch } from "../redux/store";
import { searchTracks } from "../redux/musicSlice";
import { selectMusic, selectMusicLoading } from "../redux/musicSlice";
import type { Music } from "../types";

// Tela para gerenciar músicas dentro de uma playlist específica
export default function PlaylistManage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectUser)!;
  const all = useSelector(selectPlaylists);
  const playlist = useMemo(() => all.find(p => p.id === id && p.usuarioId === user.id), [all, id, user.id]);
  const loading = useSelector(selectMusicLoading);
  const results = useSelector(selectMusic);

  // Campo de busca da API
  const [q, setQ] = useState("");

  // Garante que playlists do usuário estejam carregadas
  useEffect(() => {
    dispatch(loadForUser({ usuarioId: user.id }));
  }, [dispatch, user.id]);

  // Caso o ID não pertença ao usuário logado
  if (!playlist) {
    return <div style={{ padding: 24 }}>Playlist não encontrada ou sem permissão.</div>;
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Gerenciar: {playlist.nome}</h1>

      {/* Lista de músicas já adicionadas */}
      <h3>Músicas da playlist</h3>
      {playlist.musicas.length === 0 ? <p>Nenhuma música.</p> : (
        <ul>
          {playlist.musicas.map(m => (
            <li key={m.id}>
              <strong>{m.nome}</strong> — {m.artista} {m.genero ? `(${m.genero})` : ""}
              <button onClick={() => dispatch(removeMusic({ usuarioId: user.id, playlistId: playlist.id, musicId: m.id }))}>
                Remover
              </button>
            </li>
          ))}
        </ul>
      )}

      <hr />

      {/* Seção de busca na API */}
      <h3>Adicionar da API</h3>
      <input
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="Título ou artista..."
        onKeyDown={e => e.key === "Enter" && dispatch(searchTracks({ title: q }))}
      />
      <button onClick={() => dispatch(searchTracks({ title: q }))}>Buscar</button>

      {/* Resultados da busca */}
      {loading && <p>Carregando...</p>}
      <ul>
        {results.map((m: Music) => (
          <li key={m.id}>
            <strong>{m.nome}</strong> — {m.artista} {m.genero ? `(${m.genero})` : ""}
            <button onClick={() => dispatch(addMusic({ usuarioId: user.id, playlistId: playlist.id, music: m }))}>
              Adicionar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
