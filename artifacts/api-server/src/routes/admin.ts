import { Router, type IRouter } from "express";
import fs from "fs";
import path from "path";

const router: IRouter = Router();

const CONFIG_PATH = path.join(process.cwd(), "data", "admin-config.json");
const CATALOG_OVERRIDES_PATH = path.join(process.cwd(), "data", "catalog-overrides.json");

console.log("🔧 CONFIG_PATH resolved to:", CONFIG_PATH);
console.log("📁 Current working directory:", process.cwd());

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_KEY = process.env.TMDB_API_KEY || "b9b334be32f57187296a06cfed4f2821";
const IMG = "https://image.tmdb.org/t/p/w500";
const BACK = "https://image.tmdb.org/t/p/original";

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

function readCatalogOverrides() {
  try {
    return JSON.parse(fs.readFileSync(CATALOG_OVERRIDES_PATH, "utf-8"));
  } catch {
    return { deletedItems: [], urlOverrides: {} };
  }
}

function writeCatalogOverrides(data: unknown) {
  const dir = path.dirname(CATALOG_OVERRIDES_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(CATALOG_OVERRIDES_PATH, JSON.stringify(data, null, 2), "utf-8");
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

async function getLogoUrl(tmdbId: number | string, type: "movie" | "tv" = "movie"): Promise<string | null> {
  interface TmdbImages {
    logos?: Array<{ file_path: string; iso_639_1: string }>;
  }
  const images = await tmdbGet<TmdbImages>(`/${type}/${tmdbId}/images`, { include_image_language: "es,en,null" });
  const logo =
    images?.logos?.find((l) => l.iso_639_1 === "es")?.file_path ||
    images?.logos?.find((l) => l.iso_639_1 === "en")?.file_path ||
    images?.logos?.[0]?.file_path ||
    null;
  return logo ? `https://image.tmdb.org/t/p/original${logo}` : null;
}

router.get("/admin/config", (_req, res): void => {
  res.json(readConfig());
});

router.post("/admin/config", async (req, res): Promise<void> => {
  try {
    console.log("📝 Admin config POST received:", JSON.stringify(req.body, null, 2).substring(0, 500));
    
    // Enrich banner items with logos if missing
    const config = req.body;
    
    // Process banner items
    if (config.banner && config.banner.items && Array.isArray(config.banner.items)) {
      for (const item of config.banner.items) {
        if (!item.logoUrl && item.id) {
          console.log(`🎬 Fetching logo for banner item: ${item.titulo} (${item.id})`);
          const logoUrl = await getLogoUrl(item.id, item.tipo === "serie" || item.tipo === "anime" ? "tv" : "movie").catch(() => null);
          if (logoUrl) {
            item.logoUrl = logoUrl;
            console.log(`✅ Logo found for ${item.titulo}: ${logoUrl}`);
          } else {
            console.log(`⚠️ No logo found for ${item.titulo}`);
          }
        }
      }
    }

    // Process top10 items
    if (config.top10 && config.top10.items && Array.isArray(config.top10.items)) {
      for (const item of config.top10.items) {
        if (!item.logoUrl && item.id) {
          console.log(`🎬 Fetching logo for top10 item: ${item.titulo} (${item.id})`);
          const logoUrl = await getLogoUrl(item.id, item.tipo === "serie" || item.tipo === "anime" ? "tv" : "movie").catch(() => null);
          if (logoUrl) {
            item.logoUrl = logoUrl;
            console.log(`✅ Logo found for ${item.titulo}: ${logoUrl}`);
          } else {
            console.log(`⚠️ No logo found for ${item.titulo}`);
          }
        }
      }
    }

    writeConfig(config);
    console.log("✅ Admin config saved successfully with logos");
    res.json({ ok: true });
  } catch (e) {
    console.error("❌ Error saving admin config:", e);
    res.status(500).json({ error: String(e) });
  }
});

router.get("/admin/search-tmdb-logo", async (req, res): Promise<void> => {
  const query = (req.query.q as string) || "";
  const type = (req.query.type as string) || "movie";

  if (!query.trim()) {
    res.status(400).json({ error: "Query parameter required" });
    return;
  }

  if (!["movie", "tv"].includes(type)) {
    res.status(400).json({ error: "Invalid type" });
    return;
  }

  interface TmdbSearchResult {
    results?: Array<{
      id: number;
      title?: string;
      name?: string;
      poster_path: string | null;
    }>;
  }

  const searchData = await tmdbGet<TmdbSearchResult>(`/search/${type}`, { query });
  if (!searchData || !searchData.results || searchData.results.length === 0) {
    res.json({ logoUrl: null });
    return;
  }

  const result = searchData.results[0];
  const logoUrl = await getLogoUrl(result.id, type as "movie" | "tv").catch(() => null);

  res.json({ logoUrl });
});

router.get("/admin/get-logo/:id", async (req, res): Promise<void> => {
  const id = req.params.id;
  const type = (req.query.type as string) || "movie";

  if (!["movie", "tv"].includes(type)) {
    res.status(400).json({ error: "Invalid type" });
    return;
  }

  try {
    const logoUrl = await getLogoUrl(id, type as "movie" | "tv").catch(() => null);
    res.json({ logoUrl: logoUrl || null });
  } catch (e) {
    res.json({ logoUrl: null });
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

router.get("/admin/catalog/delete", (req, res): void => {
  const itemId = req.query.id as string;
  const itemType = req.query.type as string; // "movie" | "serie" | "anime"
  
  if (!itemId || !itemType) {
    res.status(400).json({ error: "id and type required" });
    return;
  }

  try {
    const overrides = readCatalogOverrides();
    overrides.deletedItems.push({ id: itemId, type: itemType, deletedAt: new Date().toISOString() });
    writeCatalogOverrides(overrides);
    console.log(`✅ Item deleted: ${itemType}/${itemId}`);
    res.json({ ok: true });
  } catch (e) {
    console.error("❌ Error deleting item:", e);
    res.status(500).json({ error: String(e) });
  }
});

router.post("/admin/catalog/update-url", (req, res): void => {
  const { itemId, itemType, urlReproduccion } = req.body;

  if (!itemId || !itemType || !urlReproduccion) {
    res.status(400).json({ error: "itemId, itemType, and urlReproduccion required" });
    return;
  }

  try {
    const overrides = readCatalogOverrides();
    const key = `${itemType}/${itemId}`;
    overrides.urlOverrides[key] = urlReproduccion;
    writeCatalogOverrides(overrides);
    console.log(`✅ URL updated for: ${key}`);
    res.json({ ok: true });
  } catch (e) {
    console.error("❌ Error updating URL:", e);
    res.status(500).json({ error: String(e) });
  }
});

router.get("/admin/catalog/is-deleted", (req, res): void => {
  const itemId = req.query.id as string;
  const itemType = req.query.type as string;

  const overrides = readCatalogOverrides();
  const isDeleted = overrides.deletedItems.some(
    (d: { id: string; type: string }) => d.id === itemId && d.type === itemType
  );

  res.json({ isDeleted });
});

router.get("/admin/catalog/get-url-override", (req, res): void => {
  const itemId = req.query.id as string;
  const itemType = req.query.type as string;

  if (!itemId || !itemType) {
    res.status(400).json({ error: "id and type required" });
    return;
  }

  const overrides = readCatalogOverrides();
  const key = `${itemType}/${itemId}`;
  const urlOverride = overrides.urlOverrides[key];

  res.json({ urlOverride: urlOverride || null });
});

export default router;
