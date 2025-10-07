import axios from "axios";
import type { Music } from "../types";

/* =========================================
 * Config
 * =======================================*/
const BASE_URL =
  import.meta.env.VITE_AUDIO_DB_BASE_URL ||
  "https://www.theaudiodb.com/api/v1/json/2";

/* =========================================
 * Helpers (map, dedupe, sample, enrich)
 * =======================================*/

/** Converte payloads diversos da API para nosso tipo Music (limita a 10 por chamada) */
function mapTracks(raw: any[]): Music[] {
  return (raw ?? []).slice(0, 10).map((t: any) => ({
    id: String(t.idTrack ?? t.idAlbum ?? t.idArtist ?? Math.random()),
    nome: t.strTrack ?? t.strAlbum ?? t.strTrackAlternate ?? "Desconhecida",
    artista: t.strArtist ?? "—",
    genero: t.strGenre ?? t.strStyle ?? undefined,
    // preferimos ano de lançamento; alguns endpoints usam intYear
    ano: t.intYearReleased ?? t.intYear ?? undefined,
  }));
}

/** Remove duplicados por id */
function dedupeById(list: Music[]): Music[] {
  const map = new Map<string, Music>();
  for (const m of list) map.set(m.id, m);
  return Array.from(map.values());
}

/** Sorteia k itens únicos de um array */
function sampleUnique<T>(arr: T[], k: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, k);
}

/** Enriquece faixas sem ano consultando o álbum (album.php?m=...) */
async function enrichYearFromAlbum(rawTracks: any[]): Promise<any[]> {
  const missing = rawTracks
    .filter((t) => !t?.intYearReleased && t?.idAlbum)
    .map((t) => t.idAlbum as string);

  const unique = Array.from(new Set(missing));
  if (unique.length === 0) return rawTracks;

  const results = await Promise.all(
    unique.map(async (id) => {
      try {
        const { data } = await axios.get(
          `${BASE_URL}/album.php?m=${encodeURIComponent(id)}`
        );
        const year =
          data?.album?.[0]?.intYearReleased ?? data?.album?.[0]?.intYear ?? undefined;
        return { id, year };
      } catch {
        return { id, year: undefined };
      }
    })
  );

  const yearByAlbum = new Map(results.map((r) => [r.id, r.year]));

  rawTracks.forEach((t) => {
    if (!t.intYearReleased && t.idAlbum && yearByAlbum.get(t.idAlbum)) {
      t.intYearReleased = yearByAlbum.get(t.idAlbum);
    }
  });

  return rawTracks;
}

/* =========================================
 * Endpoints principais
 * =======================================*/

export async function searchArtists(q: string) {
  const url = `${BASE_URL}/search.php?s=${encodeURIComponent(q)}`;
  const { data } = await axios.get(url);
  return data?.artists ?? [];
}

export async function topTracksByArtist(artist: string): Promise<Music[]> {
  const url = `${BASE_URL}/track-top10.php?s=${encodeURIComponent(artist)}`;
  const { data } = await axios.get(url);
  const raw = await enrichYearFromAlbum(data?.track ?? []);
  return mapTracks(raw);
}

export async function searchTrackByArtistAndTitle(
  artist: string,
  title: string
): Promise<Music[]> {
  const url = `${BASE_URL}/searchtrack.php?s=${encodeURIComponent(
    artist
  )}&t=${encodeURIComponent(title)}`;
  const { data } = await axios.get(url);
  const raw = await enrichYearFromAlbum(data?.track ?? []);
  return mapTracks(raw);
}

/** Tenta título puro; se falhar, trata como artista provável e cai em top10 */
export async function searchTracksByTitleOnly(title: string): Promise<Music[]> {
  const tryTitleOnly = `${BASE_URL}/searchtrack.php?t=${encodeURIComponent(title)}`;
  const byTitle = await axios
    .get(tryTitleOnly)
    .then((r) => r.data?.track ?? [])
    .catch(() => []);

  if (byTitle?.length) {
    const raw = await enrichYearFromAlbum(byTitle);
    return mapTracks(raw);
  }

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

/** Populares oficiais; se 404/erro, usa fallback com artistas seed */
export async function mostLovedTracks(): Promise<Music[]> {
  try {
    const url = `${BASE_URL}/mostloved.php?format=track`;
    const { data } = await axios.get(url);
    const raw = await enrichYearFromAlbum(data?.loved ?? data?.track ?? []);
    return mapTracks(raw);
  } catch {
    // fallback: compõe com top10 de artistas populares (simulação básica)
    const seeds = ["Queen", "Adele", "Coldplay", "Michael Jackson", "Taylor Swift"];
    const all: Music[] = [];
    for (const a of seeds) {
      try {
        const tt = await topTracksByArtist(a);
        all.push(...tt);
      } catch {
        // ignora falhas pontuais
      }
    }
    return dedupeById(all).slice(0, 10);
  }
}

/* =========================================
 * Populares por amostragem (simulação robusta)
 * =======================================*/

// Um pool maior de artistas pra dar variedade
const SEED_ARTISTS = [
  "Queen","Adele","Coldplay","Michael Jackson","Taylor Swift",
  "The Beatles","Ed Sheeran","Rihanna","Bruno Mars","Madonna",
  "Linkin Park","Imagine Dragons","Beyoncé","Drake","Shakira",
  "U2","Katy Perry","Eminem","Maroon 5","Elton John",
  "The Weeknd","Lady Gaga","Metallica","Pink Floyd","Nirvana",
];

/**
 * Populares simulados:
 *  - size: quantos artistas sortear (ex.: 5)
 *  - perArtist: quantas faixas pegar de cada top 10 (ex.: 3)
 *  - genreBias: se vier, filtra por gênero depois de juntar
 */
export async function popularSample(
  {
    size = 5,
    perArtist = 3,
    genreBias,
  }: { size?: number; perArtist?: number; genreBias?: string }
): Promise<Music[]> {
  const chosen = sampleUnique(SEED_ARTISTS, size);
  const all: Music[] = [];

  for (const a of chosen) {
    try {
      const top = await topTracksByArtist(a); // usa endpoint estável
      all.push(...top.slice(0, perArtist));
    } catch {
      // ignora falhas pontuais por artista
    }
  }

  // deduplica
  let list = dedupeById(all);

  // opcional: viés por gênero (só aplica se ainda mantiver >= 10)
  if (genreBias) {
    const g = genreBias.toLowerCase();
    const filtered = list.filter((t) =>
      (t.genero || "").toLowerCase().includes(g)
    );
    if (filtered.length >= 10) list = filtered;
  }

  return list.slice(0, 10);
}
