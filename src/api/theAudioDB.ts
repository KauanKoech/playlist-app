import axios from "axios";
import type { Music } from "../types";

/* =========================================
 * Config
 * =======================================*/
// URL base da TheAudioDB (usa env ou padrão público)
const BASE_URL =
  import.meta.env.VITE_AUDIO_DB_BASE_URL ||
  "https://www.theaudiodb.com/api/v1/json/2";

/* =========================================
 * Helpers (map, dedupe, sample, enrich)
 * =======================================*/

/** Mapeia payload da API para o tipo Music (máx. 10 itens) */
function mapTracks(raw: any[]): Music[] {
  return (raw ?? []).slice(0, 10).map((t: any) => ({
    id: String(t.idTrack ?? t.idAlbum ?? t.idArtist ?? Math.random()),
    nome: t.strTrack ?? t.strAlbum ?? t.strTrackAlternate ?? "Desconhecida",
    artista: t.strArtist ?? "—",
    genero: t.strGenre ?? t.strStyle ?? undefined,
    ano: t.intYearReleased ?? t.intYear ?? undefined,
  }));
}

/** Remove duplicatas pelo id */
function dedupeById(list: Music[]): Music[] {
  const map = new Map<string, Music>();
  for (const m of list) map.set(m.id, m);
  return Array.from(map.values());
}

/** Embaralha e retorna k itens únicos */
function sampleUnique<T>(arr: T[], k: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, k);
}

/** Completa ano consultando o álbum quando ausente */
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

/** Busca artistas por nome */
export async function searchArtists(q: string) {
  const url = `${BASE_URL}/search.php?s=${encodeURIComponent(q)}`;
  const { data } = await axios.get(url);
  return data?.artists ?? [];
}

/** Top 10 faixas de um artista */
export async function topTracksByArtist(artist: string): Promise<Music[]> {
  const url = `${BASE_URL}/track-top10.php?s=${encodeURIComponent(artist)}`;
  const { data } = await axios.get(url);
  const raw = await enrichYearFromAlbum(data?.track ?? []);
  return mapTracks(raw);
}

/** Busca por artista + título */
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

/** Tenta título puro; fallback: trata como artista e usa top10 */
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

  const asArtistTop = await topTracksByArtist(title);
  if (asArtistTop.length) return asArtistTop;

  const artists = await searchArtists(title);
  const name = artists?.[0]?.strArtist;
  if (name) {
    const top = await topTracksByArtist(name);
    if (top.length) return top;
  }
  return [];
}

/** Populares oficiais; fallback simulado se der erro */
export async function mostLovedTracks(): Promise<Music[]> {
  try {
    const url = `${BASE_URL}/mostloved.php?format=track`;
    const { data } = await axios.get(url);
    const raw = await enrichYearFromAlbum(data?.loved ?? data?.track ?? []);
    return mapTracks(raw);
  } catch {
    const seeds = ["Queen", "Adele", "Coldplay", "Michael Jackson", "Taylor Swift"];
    const all: Music[] = [];
    for (const a of seeds) {
      try {
        const tt = await topTracksByArtist(a);
        all.push(...tt);
      } catch {
        // ignora falhas por artista
      }
    }
    return dedupeById(all).slice(0, 10);
  }
}

/* =========================================
 * Populares por amostragem (simulação robusta)
 * =======================================*/

// Pool de artistas para variedade
const SEED_ARTISTS = [
  "Queen","Adele","Coldplay","Michael Jackson","Taylor Swift",
  "The Beatles","Ed Sheeran","Rihanna","Bruno Mars","Madonna",
  "Linkin Park","Imagine Dragons","Beyoncé","Drake","Shakira",
  "U2","Katy Perry","Eminem","Maroon 5","Elton John",
  "The Weeknd","Lady Gaga","Metallica","Pink Floyd","Nirvana",
];

/** Composição de “populares” simulados com filtros opcionais */
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
      const top = await topTracksByArtist(a);
      all.push(...top.slice(0, perArtist));
    } catch {
      // ignora falhas por artista
    }
  }

  let list = dedupeById(all);

  // Viés por gênero (só aplica se ainda mantiver variedade)
  if (genreBias) {
    const g = genreBias.toLowerCase();
    const filtered = list.filter((t) =>
      (t.genero || "").toLowerCase().includes(g)
    );
    if (filtered.length >= 10) list = filtered;
  }

  return list.slice(0, 10);
}
