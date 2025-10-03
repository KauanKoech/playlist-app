import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  searchTrackByArtistAndTitle,
  searchTracksByTitleOnly,
  mostLovedTracks,
  popularSample, // << ADICIONE ESTE IMPORT
} from "../api/theAudioDB";
import type { Music } from "../types";

export const searchTracks = createAsyncThunk<
  Music[],
  {
    title?: string;
    artist?: string;
    genre?: string;
    year?: string;
    popular?: boolean; // populares (tenta oficial e cai no simulado)
    popularSimArgs?: { size?: number; perArtist?: number; genreBias?: string }; // args opcionais
  }
>("music/searchTracks", async (query) => {
  // POPULARES
  if (query.popular) {
    try {
      const loved = await mostLovedTracks();
      if (loved.length) return loved;
    } catch {
      // ignora e cai no simulado
    }
    const sim = await popularSample(query.popularSimArgs ?? { size: 6, perArtist: 2 });
    return sim;
  }

  // BUSCA NORMAL
  const artist = (query.artist || "").trim();
  const title  = (query.title  || "").trim();
  let tracks: Music[] = [];

  if (artist && title) {
    tracks = await searchTrackByArtistAndTitle(artist, title);
  } else if (artist) {
    tracks = await searchTracksByTitleOnly(artist); // cai no top10 do artista
  } else if (title) {
    tracks = await searchTracksByTitleOnly(title);  // heurística título puro
  }

  // FILTROS client-side
  if (query.genre?.trim()) {
    const g = query.genre.toLowerCase();
    tracks = tracks.filter(t => (t.genero || "").toLowerCase().includes(g));
  }
  if (query.year?.trim()) {
    const y = query.year.trim();
    tracks = tracks.filter(t => (t.ano ? String(t.ano).startsWith(y) : false));
  }

  return tracks;
});

type State = { items: Music[]; loading: boolean; error?: string | null };
const slice = createSlice({
  name: "music",
  initialState: { items: [], loading: false, error: null } as State,
  reducers: {
    clear(state) {
      state.items = [];
      state.error = null;
    },
  },
  extraReducers: (b) => {
    b.addCase(searchTracks.pending, (s) => { s.loading = true; s.error = null; });
    b.addCase(searchTracks.fulfilled, (s, a) => { s.loading = false; s.items = a.payload ?? []; });
    b.addCase(searchTracks.rejected, (s, a) => { s.loading = false; s.error = a.error.message || "Erro na busca."; });
  },
});

export const { clear } = slice.actions;

type MusicRoot = { music: State };
export const selectMusic         = (s: MusicRoot) => s.music.items;
export const selectMusicLoading  = (s: MusicRoot) => s.music.loading;
export const selectMusicError    = (s: MusicRoot) => s.music.error;

export default slice.reducer;
