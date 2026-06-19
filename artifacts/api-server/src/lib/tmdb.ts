const TMDB_BASE = "https://api.themoviedb.org/3";
const API_KEY = process.env.TMDB_API_KEY || "b9b334be32f57187296a06cfed4f2821";

async function tmdbGet<T>(path: string, params?: Record<string, string>): Promise<T | null> {
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set("api_key", API_KEY);
  url.searchParams.set("language", "es-ES");
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }
  }
  const res = await fetch(url.toString());
  if (!res.ok) return null;
  return res.json() as Promise<T>;
}

interface TmdbMovieDetail {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count?: number;
  genres: Array<{ id: number; name: string }>;
  runtime?: number;
  episode_run_time?: number[];
  spoken_languages?: Array<{ english_name: string; iso_639_1: string; name: string }>;
  original_language?: string;
  tagline?: string;
  status?: string;
  budget?: number;
  revenue?: number;
  production_countries?: Array<{ iso_3166_1: string; name: string }>;
  number_of_seasons?: number;
  number_of_episodes?: number;
  created_by?: Array<{ id: number; name: string; profile_path: string | null }>;
  networks?: Array<{ id: number; name: string; logo_path: string | null }>;
  popularity?: number;
}

interface TmdbCredits {
  cast: Array<{
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
    order?: number;
  }>;
  crew: Array<{
    id: number;
    name: string;
    job: string;
    department: string;
    profile_path: string | null;
  }>;
}

interface TmdbExternalIds {
  imdb_id: string | null;
  facebook_id?: string | null;
  instagram_id?: string | null;
}

interface TmdbReleaseDates {
  results: Array<{
    iso_3166_1: string;
    release_dates: Array<{
      certification: string;
      type: number;
      release_date: string;
    }>;
  }>;
}

interface TmdbContentRatings {
  results: Array<{
    iso_3166_1: string;
    rating: string;
  }>;
}

interface TmdbPersonDetail {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  place_of_birth: string | null;
  profile_path: string | null;
  known_for_department: string;
}

interface TmdbCombinedCredits {
  cast: Array<{
    id: number;
    title?: string;
    name?: string;
    poster_path: string | null;
    release_date?: string;
    first_air_date?: string;
    vote_average: number;
    media_type: string;
    character: string;
  }>;
}

interface TmdbVideos {
  results: Array<{
    key: string;
    site: string;
    type: string;
    name: string;
    iso_639_1?: string;
  }>;
}

interface TmdbImages {
  logos: Array<{ file_path: string; iso_639_1: string }>;
}

interface TmdbRecommendations {
  results: Array<{
    id: number;
    title?: string;
    name?: string;
    poster_path: string | null;
    overview: string;
    vote_average: number;
  }>;
}

export async function getTmdbPerson(personId: string) {
  const [person, credits] = await Promise.all([
    tmdbGet<TmdbPersonDetail>(`/person/${personId}`),
    tmdbGet<TmdbCombinedCredits>(`/person/${personId}/combined_credits`),
  ]);

  if (!person) return null;

  return {
    id: person.id,
    name: person.name,
    biography: person.biography || null,
    birthday: person.birthday || null,
    placeOfBirth: person.place_of_birth || null,
    profilePath: person.profile_path
      ? `https://image.tmdb.org/t/p/w300${person.profile_path}`
      : null,
    knownFor: person.known_for_department || null,
    credits: (credits?.cast || [])
      .filter((c) => c.poster_path)
      .sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0))
      .slice(0, 20)
      .map((c) => ({
        id: c.id,
        title: c.title || c.name || "",
        posterPath: c.poster_path
          ? `https://image.tmdb.org/t/p/w185${c.poster_path}`
          : null,
        year: (c.release_date || c.first_air_date || "").split("-")[0] || null,
        mediaType: c.media_type,
        character: c.character || null,
        voteAverage: c.vote_average || null,
      })),
  };
}

export async function getLogoUrl(tmdbId: string, type: "movie" | "tv" = "movie"): Promise<string | null> {
  const images = await tmdbGet<TmdbImages>(`/${type}/${tmdbId}/images`, { include_image_language: "es,en,null" });
  const logo =
    images?.logos?.find((l) => l.iso_639_1 === "es")?.file_path ||
    images?.logos?.find((l) => l.iso_639_1 === "en")?.file_path ||
    images?.logos?.[0]?.file_path ||
    null;
  return logo ? `https://image.tmdb.org/t/p/original${logo}` : null;
}

export async function getTmdbDetails(tmdbId: string, type: "movie" | "tv" = "movie") {
  const [detail, credits, videos, images, recommendations, externalIds, ratingsRaw] = await Promise.all([
    tmdbGet<TmdbMovieDetail>(`/${type}/${tmdbId}`),
    tmdbGet<TmdbCredits>(`/${type}/${tmdbId}/credits`),
    tmdbGet<TmdbVideos>(`/${type}/${tmdbId}/videos`, { include_video_language: "es-419,es,en,null" }),
    tmdbGet<TmdbImages>(`/${type}/${tmdbId}/images`, { include_image_language: "es,en,null" }),
    tmdbGet<TmdbRecommendations>(`/${type}/${tmdbId}/recommendations`),
    tmdbGet<TmdbExternalIds>(`/${type}/${tmdbId}/external_ids`),
    type === "movie"
      ? tmdbGet<TmdbReleaseDates>(`/${type}/${tmdbId}/release_dates`)
      : tmdbGet<TmdbContentRatings>(`/${type}/${tmdbId}/content_ratings`),
  ]);

  if (!detail) return null;

  const logo =
    images?.logos?.find((l) => l.iso_639_1 === "es")?.file_path ||
    images?.logos?.find((l) => l.iso_639_1 === "en")?.file_path ||
    images?.logos?.[0]?.file_path ||
    null;

  // Extract director and writers from crew
  const crew = credits?.crew || [];
  const directors = crew.filter((c) => c.job === "Director").map((c) => c.name);
  const writers = crew
    .filter((c) => c.job === "Screenplay" || c.job === "Writer" || c.job === "Story")
    .slice(0, 3)
    .map((c) => c.name);

  // Extract content rating (US certification)
  let contentRating: string | null = null;
  if (type === "movie") {
    const releaseDates = ratingsRaw as TmdbReleaseDates | null;
    const usRating = releaseDates?.results?.find((r) => r.iso_3166_1 === "US");
    if (usRating) {
      const theatrical = usRating.release_dates.find((rd) => rd.type === 3 && rd.certification);
      const anyRating = usRating.release_dates.find((rd) => rd.certification);
      contentRating = theatrical?.certification || anyRating?.certification || null;
    }
    if (!contentRating) {
      const anyCountry = releaseDates?.results?.find((r) =>
        r.release_dates.some((rd) => rd.certification)
      );
      contentRating = anyCountry?.release_dates.find((rd) => rd.certification)?.certification || null;
    }
  } else {
    const tvRatings = ratingsRaw as TmdbContentRatings | null;
    const usRating = tvRatings?.results?.find((r) => r.iso_3166_1 === "US");
    contentRating = usRating?.rating || null;
  }

  // Spoken languages — deduplicated, English names
  const spokenLanguages = (detail.spoken_languages || [])
    .map((l) => l.english_name || l.name)
    .filter(Boolean);

  // Production countries
  const productionCountries = (detail.production_countries || [])
    .map((c) => c.name)
    .filter(Boolean);

  // Runtime
  let runtime: number | null = null;
  if (type === "movie" && detail.runtime) {
    runtime = detail.runtime;
  } else if (type === "tv" && detail.episode_run_time && detail.episode_run_time.length > 0) {
    runtime = detail.episode_run_time[0];
  }

  // Networks (TV)
  const networks = (detail.networks || []).map((n) => ({
    name: n.name,
    logoPath: n.logo_path ? `https://image.tmdb.org/t/p/w92${n.logo_path}` : null,
  }));

  // Created by (TV)
  const createdBy = (detail.created_by || []).map((c) => c.name);

  return {
    id: detail.id,
    title: detail.title || detail.name || "",
    overview: detail.overview || null,
    posterPath: detail.poster_path
      ? `https://image.tmdb.org/t/p/w500${detail.poster_path}`
      : null,
    backdropPath: detail.backdrop_path
      ? `https://image.tmdb.org/t/p/original${detail.backdrop_path}`
      : null,
    logoPath: logo ? `https://image.tmdb.org/t/p/original${logo}` : null,
    releaseDate: detail.release_date || detail.first_air_date || null,
    voteAverage: detail.vote_average || null,
    voteCount: detail.vote_count || null,
    genres: detail.genres?.map((g) => g.name) || [],
    runtime,
    director: directors.length > 0 ? directors.join(", ") : null,
    writers: writers.length > 0 ? writers : [],
    spokenLanguages,
    originalLanguage: detail.original_language || null,
    tagline: detail.tagline || null,
    status: detail.status || null,
    budget: (detail.budget && detail.budget > 0) ? detail.budget : null,
    revenue: (detail.revenue && detail.revenue > 0) ? detail.revenue : null,
    productionCountries,
    imdbId: externalIds?.imdb_id || null,
    contentRating,
    numberOfSeasons: detail.number_of_seasons || null,
    numberOfEpisodes: detail.number_of_episodes || null,
    createdBy,
    networks,
    cast:
      credits?.cast?.slice(0, 15).map((c) => ({
        personId: c.id ?? null,
        name: c.name,
        character: c.character || null,
        profilePath: c.profile_path
          ? `https://image.tmdb.org/t/p/w185${c.profile_path}`
          : null,
      })) || [],
    videos: (() => {
      const all = (videos?.results || []).filter(
        (v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
      );
      const spanishLangs = ["es-419", "es"];
      const sorted = [
        ...all.filter((v) => spanishLangs.includes(v.iso_639_1 || "")),
        ...all.filter((v) => !spanishLangs.includes(v.iso_639_1 || "")),
      ];
      return sorted.slice(0, 3).map((v) => ({ key: v.key, site: v.site, type: v.type, name: v.name }));
    })(),
    recommendations:
      recommendations?.results?.slice(0, 12).map((r) => ({
        id: r.id,
        title: r.title || r.name || "",
        posterPath: r.poster_path
          ? `https://image.tmdb.org/t/p/w300${r.poster_path}`
          : null,
        overview: r.overview || null,
        voteAverage: r.vote_average || null,
      })) || [],
  };
}
