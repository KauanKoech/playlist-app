import axios from "axios";
import type { Music } from "../types";

const BASE_URL =
  import.meta.env.VITE_AUDIO_DB_BASE_URL ||
  "https://www.theaudiodb.com/api/v1/json/2";

function mapTracks(raw: any[]): Music[] {
  return (raw ?? []).slice(0, 10).map((t: any) => ({
    id: String(t.idTrack ?? t.idAlbum ?? t.idArtist ?? Math.random()),
    nome: t.strTrack ?? t.strAlbum ?? t.strTrackAlternate ?? "Desconhecida",
    artista: t.strArtist ?? "—",
    genero: t.strGenre ?? t.strStyle ?? undefined,
    ano: t.intYearReleased ?? t.intYear ?? t.intYearReleased ?? undefined,
  }));
}

export async function searchArtists(q: string) {
  const url = `${BASE_URL}/search.php?s=${encodeURIComponent(q)}`;
  const { data } = await axios.get(url);
  return data?.artists ?? [];
}

export async function topTracksByArtist(artist: string): Promise<Music[]> {
  const url = `${BASE_URL}/track-top10.php?s=${encodeURIComponent(artist)}`;
  const { data } = await axios.get(url);
  return mapTracks(data?.track ?? []);
}

export async function searchTrackByArtistAndTitle(artist: string, title: string): Promise<Music[]> {
  const url = `${BASE_URL}/searchtrack.php?s=${encodeURIComponent(artist)}&t=${encodeURIComponent(title)}`;
  const { data } = await axios.get(url);
  return mapTracks(data?.track ?? []);
}

export async function searchTracksByTitleOnly(title: string): Promise<Music[]> {
  // heurística: tentar como título sozinho; se vier vazio, tenta como artista.
  const tryTitleOnly = `${BASE_URL}/searchtrack.php?t=${encodeURIComponent(title)}`;
  const byTitle = await axios.get(tryTitleOnly).then(r => r.data?.track ?? []).catch(() => []);
  if (byTitle?.length) return mapTracks(byTitle);

  // tenta como artista → top 10
  const asArtistTop = await topTracksByArtist(title);
  if (asArtistTop.length) return asArtistTop;

  // resolve artista mais provável e tenta top10
  const artists = await searchArtists(title);
  const name = artists?.[0]?.strArtist;
  if (name) {
    const top = await topTracksByArtist(name);
    if (top.length) return top;
  }
  return [];
}

export async function mostLovedTracks(): Promise<Music[]> {
  try {
    const url = `${BASE_URL}/mostloved.php?format=track`;
    const { data } = await axios.get(url);
    return mapTracks(data?.loved ?? data?.track ?? []);
  } catch {
    // fallback: compõe com top10 de artistas populares
    const seeds = ["Queen", "Adele", "Coldplay", "Michael Jackson", "Taylor Swift"];
    const all: Music[] = [];
    for (const a of seeds) {
      try {
        const tt = await topTracksByArtist(a);
        all.push(...tt);
      } catch { /* ignora */ }
    }
    // remove duplicados por id
    const uniq = new Map<string, Music>();
    all.forEach(m => uniq.set(m.id, m));
    return Array.from(uniq.values()).slice(0, 10);
  }
}
