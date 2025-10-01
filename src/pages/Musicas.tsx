import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo, useRef, useState } from "react";
import type { AppDispatch, RootState } from "../redux/store";
import {
  searchTracks,
  selectMusic,
  selectMusicLoading,
  selectMusicError,
} from "../redux/musicSlice";
import { selectPlaylists, addMusic } from "../redux/playlistSlice";
import { selectUser } from "../redux/userSlice";
import type { Music, Playlist } from "../types";

export default function Musicas() {
  const dispatch = useDispatch<AppDispatch>();
  const music = useSelector<RootState, Music[]>(selectMusic);
  const loading = useSelector(selectMusicLoading);
  const error = useSelector(selectMusicError);
  const playlists = useSelector<RootState, Playlist[]>(selectPlaylists);
  const user = useSelector(selectUser)!;

  // campos de busca
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");

  // filtros (derivados do resultado)
  const [genre, setGenre] = useState("");
  const [year, setYear] = useState("");

  // valores disponíveis vindos do resultado
  const availableGenres = useMemo(() => {
    const set = new Set<string>();
    music.forEach(m => m.genero && set.add(m.genero));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [music]);

  const availableYears = useMemo(() => {
    const set = new Set<string>();
    music.forEach(m => m.ano && set.add(String(m.ano)));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [music]);

  // aplica filtros client-side nos resultados atuais
  const filtered = useMemo(() => {
    let list = music;
    if (genre) list = list.filter(m => (m.genero || "") === genre);
    if (year) list = list.filter(m => String(m.ano || "") === year);
    return list;
  }, [music, genre, year]);

  // debounce
  const timer = useRef<number | null>(null);

  const doSearch = () => {
    // regra: título sozinho é frágil; só busca título se tiver artista.
    if (title && !artist) return;
    // dispara se artista existir, ou se (artista + título)
    if (artist || (artist && title)) {
      dispatch(
        searchTracks({
          artist: artist.trim(),
          title: title.trim(),
        })
      );
    }
  };

  useEffect(() => {
    if (!(artist || title)) return; // não busca vazio
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(doSearch, 400);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artist, title]);

  const doPopular = () => {
    setGenre("");
    setYear("");
    dispatch(searchTracks({ popular: true }));
  };

  const userPlaylists = playlists.filter(p => p.usuarioId === user.id);

  return (
    <div style={{ padding: 24 }}>
      <h1>Músicas</h1>

      {/* Barra de busca */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 2fr auto",
          gap: 8,
          maxWidth: 820,
        }}
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título (ex.: Yellow)"
          aria-label="Título da música"
        />
        <input
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          placeholder="Artista (ex.: Coldplay) — obrigatório para buscar por título"
          aria-label="Artista"
        />
        <button onClick={doPopular}>Populares</button>
      </div>

      {/* aviso quando digitou título sem artista */}
      {title && !artist && (
        <p className="muted" style={{ marginTop: 6 }}>
          Para buscar por <strong>título</strong>, informe também o <strong>artista</strong>.
        </p>
      )}

      {/* filtros derivados */}
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <select value={genre} onChange={(e) => setGenre(e.target.value)}>
          <option value="">Filtrar por gênero</option>
          {availableGenres.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
        <select value={year} onChange={(e) => setYear(e.target.value)}>
          <option value="">Filtrar por ano</option>
          {availableYears.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        {(genre || year) && (
          <button onClick={() => { setGenre(""); setYear(""); }}>Limpar filtros</button>
        )}
      </div>

      {/* estados */}
      {loading && <p>Carregando…</p>}
      {!loading && error && <p style={{ color: "#ff7d7d" }}>{error}</p>}
      {!loading && !error && (artist || title) && filtered.length === 0 && (
        <p>Nenhum resultado encontrado.</p>
      )}
      {!loading && !error && !artist && !title && filtered.length === 0 && (
        <p className="muted">Dica: preencha <em>Artista</em> e opcionalmente o <em>Título</em>, ou clique “Populares”.</p>
      )}

      {/* lista */}
      <ul style={{ marginTop: 12 }}>
        {filtered.map((m) => {
          const selectId = `sel-${m.id}`;
          return (
            <li key={m.id} style={{ marginBottom: 10 }}>
              <strong>{m.nome}</strong> — {m.artista}
              {m.genero ? ` (${m.genero})` : ""} {m.ano ? `• ${m.ano}` : ""}
              <div style={{ marginTop: 6 }}>
                <select id={selectId} defaultValue="">
                  <option value="" disabled>Escolher playlist</option>
                  {userPlaylists.map((p) => (
                    <option key={p.id} value={p.id}>{p.nome}</option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    const sel = document.getElementById(selectId) as HTMLSelectElement | null;
                    if (!sel || !sel.value) return;
                    dispatch(addMusic({ usuarioId: user.id, playlistId: sel.value, music: m }));
                    sel.value = "";
                  }}
                  disabled={userPlaylists.length === 0}
                >
                  Adicionar
                </button>
                {userPlaylists.length === 0 && (
                  <span className="muted" style={{ marginLeft: 8 }}>
                    crie uma playlist primeiro
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
