import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../types";
import { getSessionUser, setSessionUser, clearSessionUser } from "../utils/storage";

type UserWithMeta = User & { lastLogin?: string };

type UserState = { user: UserWithMeta | null };

const initialState: UserState = {
  user: getSessionUser(), 
};

const slice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login(state, action: PayloadAction<User>) {
      state.user = { ...action.payload, lastLogin: new Date().toISOString() };
      setSessionUser(action.payload);
    },
    logout(state) {
      state.user = null;
      clearSessionUser();
    },
  },
});

export const { login, logout } = slice.actions;

type UserRootForSelector = { user: UserState };
export const selectUser = (s: UserRootForSelector) => s.user.user;
export const selectIsAuthenticated = (s: UserRootForSelector) => !!s.user.user;

export default slice.reducer;
