import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Playlist, Music } from "../types";
import { loadPlaylists, savePlaylists } from "../utils/storage";

type State = { items: Playlist[]; ownerId: string | null };
const initialState: State = { items: [], ownerId: null };

const slice = createSlice({
  name: "playlists",
  initialState,
  reducers: {
    loadForUser(state, action: PayloadAction<{ usuarioId: string }>) {
      state.ownerId = action.payload.usuarioId;
      state.items = loadPlaylists(action.payload.usuarioId);
    },
    createPlaylist(state, action: PayloadAction<{ usuarioId: string; nome: string }>) {
      const { usuarioId, nome } = action.payload;
      const p: Playlist = { id: crypto.randomUUID(), nome, usuarioId, musicas: [] };
      state.items.push(p);
      savePlaylists(usuarioId, state.items.filter(i => i.usuarioId === usuarioId));
    },
    updatePlaylistName(state, action: PayloadAction<{ usuarioId: string; id: string; nome: string }>) {
      const { usuarioId, id, nome } = action.payload;
      const p = state.items.find(x => x.id === id && x.usuarioId === usuarioId);
      if (p) {
        p.nome = nome;
        savePlaylists(usuarioId, state.items.filter(i => i.usuarioId === usuarioId));
      }
    },
    deletePlaylist(state, action: PayloadAction<{ usuarioId: string; id: string }>) {
      const { usuarioId, id } = action.payload;
      state.items = state.items.filter(p => !(p.id === id && p.usuarioId === usuarioId));
      savePlaylists(usuarioId, state.items.filter(i => i.usuarioId === usuarioId));
    },
    addMusic(state, action: PayloadAction<{ usuarioId: string; playlistId: string; music: Music }>) {
      const { usuarioId, playlistId, music } = action.payload;
      const p = state.items.find(x => x.id === playlistId && x.usuarioId === usuarioId);
      if (p && !p.musicas.some(m => m.id === music.id)) {
        p.musicas.push(music);
        savePlaylists(usuarioId, state.items.filter(i => i.usuarioId === usuarioId));
      }
    },
    removeMusic(state, action: PayloadAction<{ usuarioId: string; playlistId: string; musicId: string }>) {
      const { usuarioId, playlistId, musicId } = action.payload;
      const p = state.items.find(x => x.id === playlistId && x.usuarioId === usuarioId);
      if (p) {
        p.musicas = p.musicas.filter(m => m.id !== musicId);
        savePlaylists(usuarioId, state.items.filter(i => i.usuarioId === usuarioId));
      }
    },
  },
});

export const {
  loadForUser,
  createPlaylist,
  updatePlaylistName,
  deletePlaylist,
  addMusic,
  removeMusic,
} = slice.actions;

type RootForSelector = { playlists: State };
export const selectPlaylists = (s: RootForSelector) => s.playlists.items;

export default slice.reducer;
