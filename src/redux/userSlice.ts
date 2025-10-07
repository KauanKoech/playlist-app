import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../types";
import { getSessionUser, setSessionUser, clearSessionUser } from "../utils/storage";

// Tipo estendido com metadado opcional de último login
type UserWithMeta = User & { lastLogin?: string };

// Estado do slice de usuário
type UserState = { user: UserWithMeta | null };

// Estado inicial: tenta carregar usuário da sessão
const initialState: UserState = {
  user: getSessionUser(),
};

// Slice responsável por login/logout e persistência de sessão
const slice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // Faz login e salva usuário na sessão
    login(state, action: PayloadAction<User>) {
      state.user = { ...action.payload, lastLogin: new Date().toISOString() };
      setSessionUser(action.payload);
    },
    // Faz logout e limpa sessão
    logout(state) {
      state.user = null;
      clearSessionUser();
    },
  },
});

// Exporta actions e reducer do slice
export const { login, logout } = slice.actions;

// Selectors para acessar usuário e autenticação
type UserRootForSelector = { user: UserState };
export const selectUser = (s: UserRootForSelector) => s.user.user;
export const selectIsAuthenticated = (s: UserRootForSelector) => !!s.user.user;

export default slice.reducer;
