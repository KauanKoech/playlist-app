import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  mostLovedTracks,
  searchTrackByArtistAndTitle,
  searchTracksByTitleOnly,
} from "../api/theAudioDB";
import type { Music } from "../types";

export const searchTracks = createAsyncThunk<
  Music[],
  { title?: string; artist?: string; genre?: string; year?: string; popular?: boolean }
>("music/searchTracks", async (query) => {
  if (query.popular) {
    return await mostLovedTracks();
  }

  const artist = (query.artist || "").trim();
  const title  = (query.title  || "").trim();

  let tracks: Music[] = [];
  if (artist && title) {
    tracks = await searchTrackByArtistAndTitle(artist, title);
  } else if (title) {
    tracks = await searchTracksByTitleOnly(title);
  } else if (artist) {
    // quando só artista: reutiliza a heurística do título (que cai no top10 do artista)
    tracks = await searchTracksByTitleOnly(artist);
  }

  // filtros client-side (tolerantes)
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
