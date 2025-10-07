import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import playlistReducer from "./playlistSlice";
import musicReducer from "./musicSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    playlists: playlistReducer,
    music: musicReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
