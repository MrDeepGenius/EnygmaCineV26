import { Router, type IRouter } from "express";
import fs from "fs";
import path from "path";

const router: IRouter = Router();

const CONFIG_PATH = path.join(process.cwd(), "data", "admin-config.json");

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_KEY = process.env.TMDB_API_KEY || "b9b334be32f57187296a06cfed4f2821";
const IMG = "https://image.tmdb.org/t/p/w500";
const BACK = "https://image.tmdb.org/t/p/w1280";

function readConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
  } catch {
    return { banner: { override: false, items: [] }, top10: { override: false, items: [] }, hiddenSections: [], customSections: [] };
  }
}

function writeConfig(data: unknown) {
  const dir = path.dirname(CONFIG_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2), "utf-8");
}

async function tmdbGet<T>(path: string, params: Record<string, string> = {}): Promise<T | null> {
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set("api_key", TMDB_KEY);
  url.searchParams.set("language", "es-ES");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString());
  if (!res.ok) return null;
  return res.json() as Promise<T>;
}

router.get("/admin/config", (_req, res): void => {
  res.json(readConfig());
});

router.post("/admin/config", (req, res): void => {
  try {
    writeConfig(req.body);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

router.get("/admin/tmdb-fetch", async (req, res): Promise<void> => {
  const type = (req.query.type as string) || "trending";
  let endpoint = "/trending/all/week";
  if (type === "popular_movies") endpoint = "/movie/popular";
  if (type === "popular_series") endpoint = "/tv/popular";
  if (type === "upcoming") endpoint = "/movie/upcoming";
  if (type === "top_rated") endpoint = "/movie/top_rated";
  if (type === "top_rated_series") endpoint = "/tv/top_rated";

  interface TmdbListResult {
    results: Array<{
      id: number;
      title?: string;
      name?: string;
      media_type?: string;
      poster_path: string | null;
      backdrop_path: string | null;
      overview: string;
      vote_average: number;
      release_date?: string;
      first_air_date?: string;
    }>;
  }

  const data = await tmdbGet<TmdbListResult>(endpoint, { page: "1" });
  if (!data) { res.status(502).json({ error: "TMDB error" }); return; }

  const items = data.results.slice(0, 20).map((item) => ({
    id: String(item.id),
    tmdbId: item.id,
    titulo: item.title || item.name || "Sin título",
    tipo: item.media_type === "tv" ? "serie" : (type.includes("series") ? "serie" : "movie"),
    posterUrl: item.poster_path ? `${IMG}${item.poster_path}` : null,
    backdropUrl: item.backdrop_path ? `${BACK}${item.backdrop_path}` : null,
    overview: item.overview,
    year: (item.release_date || item.first_air_date || "").slice(0, 4),
    rating: item.vote_average,
  }));

  res.json({ items });
});

export default router;
