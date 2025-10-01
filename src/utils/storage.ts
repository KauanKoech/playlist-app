import type { Playlist, User } from "../types";

const keyPlaylists = (userId: string) => `playlists:${userId}`;
const keySessionUser = "session:user";

export function savePlaylists(userId: string, playlists: Playlist[]) {
  localStorage.setItem(keyPlaylists(userId), JSON.stringify(playlists));
}
export function loadPlaylists(userId: string): Playlist[] {
  const raw = localStorage.getItem(keyPlaylists(userId));
  return raw ? (JSON.parse(raw) as Playlist[]) : [];
}

export function setSessionUser(user: User) {
  sessionStorage.setItem(
    keySessionUser,
    JSON.stringify({ ...user, lastLogin: new Date().toISOString() })
  );
}
export function getSessionUser(): (User & { lastLogin?: string }) | null {
  const raw = sessionStorage.getItem(keySessionUser);
  return raw ? JSON.parse(raw) : null;
}
export function clearSessionUser() {
  sessionStorage.removeItem(keySessionUser);
}
