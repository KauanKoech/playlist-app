import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Playlist, Music } from "../types";
import { loadPlaylists, savePlaylists } from "../utils/storage";

// Estado das playlists (lista e dono atual)
type State = { items: Playlist[]; ownerId: string | null };
const initialState: State = { items: [], ownerId: null };

// Slice responsável por gerenciar playlists no Redux
const slice = createSlice({
  name: "playlists",
  initialState,
  reducers: {
    // Carrega playlists do usuário logado
    loadForUser(state, action: PayloadAction<{ usuarioId: string }>) {
      state.ownerId = action.payload.usuarioId;
      state.items = loadPlaylists(action.payload.usuarioId);
    },

    // Cria uma nova playlist para o usuário
    createPlaylist(state, action: PayloadAction<{ usuarioId: string; nome: string }>) {
      const { usuarioId, nome } = action.payload;
      const p: Playlist = { id: crypto.randomUUID(), nome, usuarioId, musicas: [] };
      state.items.push(p);
      savePlaylists(usuarioId, state.items.filter(i => i.usuarioId === usuarioId));
    },

    // Atualiza o nome de uma playlist existente
    updatePlaylistName(state, action: PayloadAction<{ usuarioId: string; id: string; nome: string }>) {
      const { usuarioId, id, nome } = action.payload;
      const p = state.items.find(x => x.id === id && x.usuarioId === usuarioId);
      if (p) {
        p.nome = nome;
        savePlaylists(usuarioId, state.items.filter(i => i.usuarioId === usuarioId));
      }
    },

    // Exclui uma playlist do usuário
    deletePlaylist(state, action: PayloadAction<{ usuarioId: string; id: string }>) {
      const { usuarioId, id } = action.payload;
      state.items = state.items.filter(p => !(p.id === id && p.usuarioId === usuarioId));
      savePlaylists(usuarioId, state.items.filter(i => i.usuarioId === usuarioId));
    },

    // Adiciona uma música a uma playlist
    addMusic(state, action: PayloadAction<{ usuarioId: string; playlistId: string; music: Music }>) {
      const { usuarioId, playlistId, music } = action.payload;
      const p = state.items.find(x => x.id === playlistId && x.usuarioId === usuarioId);
      if (p && !p.musicas.some(m => m.id === music.id)) {
        p.musicas.push(music);
        savePlaylists(usuarioId, state.items.filter(i => i.usuarioId === usuarioId));
      }
    },

    // Remove uma música de uma playlist
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

// Exporta actions e selector
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
