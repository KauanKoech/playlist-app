import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import playlistReducer from "./playlistSlice";
import musicReducer from "./musicSlice";

// Cria e configura o store global do Redux
export const store = configureStore({
  reducer: {
    user: userReducer,        // estado do usuário
    playlists: playlistReducer, // estado das playlists
    music: musicReducer,        // estado das músicas
  },
});

// Tipos auxiliares para o uso do Redux com TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
