import { useRoute, Link } from "wouter";
import {
  Play, Heart, Star, Calendar, ListVideo, ChevronLeft, PlayCircle,
  Globe, Mic2, Subtitles, Film, User, Award, ExternalLink,
  ChevronRight, Video, Tv,
} from "lucide-react";
import { useState } from "react";
import { useGetSeriesDetail, getGetSeriesDetailQueryKey, useGetAnimeDetail, getGetAnimeDetailQueryKey, useGetTmdbDetails, getGetTmdbDetailsQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { ActorModal } from "@/components/actor-modal";
import { TrailerModal } from "@/components/trailer-modal";
import { StreamingPlatforms } from "@/components/streaming-platforms";
import { useFavorites } from "@/lib/use-favorites";

function ratingToPercent(v: number) {
  return Math.round(v * 10);
}

const LANG_NAMES: Record<string, string> = {
  en: "Inglés", es: "Español", fr: "Francés", de: "Alemán",
  it: "Italiano", pt: "Portugués", ja: "Japonés", ko: "Coreano",
  zh: "Chino", ru: "Ruso", ar: "Árabe", hi: "Hindi",
};

export default function SeriesDetail() {
  const [, params] = useRoute("/detail/:type/:id");
  const type = params?.type;
  const id = params?.id;

  const [activeSeason, setActiveSeason] = useState<string>("1");

  const { data: seriesData, isLoading: seriesLoading } = useGetSeriesDetail(id || "", {
    query: { enabled: !!id && type === "serie", queryKey: getGetSeriesDetailQueryKey(id || "") },
  });
  const { data: animeData, isLoading: animeLoading } = useGetAnimeDetail(id || "", {
    query: { enabled: !!id && type === "anime", queryKey: getGetAnimeDetailQueryKey(id || "") },
  });

  const { data: tmdb } = useGetTmdbDetails(
    { tmdbId: id || "", type: "tv" },
    { query: { enabled: !!id, queryKey: getGetTmdbDetailsQueryKey({ tmdbId: id || "", type: "tv" }) } }
  );

  const { toggle, isFavorite } = useFavorites();
  const [selectedActorId, setSelectedActorId] = useState<number | null>(null);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);

  const data = type === "serie" ? seriesData : animeData;
  const isLoading = type === "serie" ? seriesLoading : animeLoading;

  if (isLoading) {
    return (
      <Layout>
        <div className="w-full h-[70vh] bg-zinc-900 animate-pulse" />
        <div className="container mx-auto px-4 py-8 space-y-4">
          <div className="h-10 w-1/3 bg-zinc-800 animate-pulse rounded" />
          <div className="h-32 w-2/3 bg-zinc-800 animate-pulse rounded" />
        </div>
      </Layout>
    );
  }

  if (!data) return null;

  const { series, episodes } = data;
  const favorited = isFavorite(series.id);
  const cast = tmdb?.cast || [];
  const recommendations = tmdb?.recommendations || [];
  const trailerVideo = tmdb?.videos?.[0] ?? null;

  const seasons = Array.from(new Set(episodes.map((e) => e.temporada || "1"))).sort(
    (a, b) => parseInt(a) - parseInt(b)
  );
  if (seasons.length > 0 && !seasons.includes(activeSeason)) {
    setActiveSeason(seasons[0]);
  }

  const seasonEpisodes = episodes
    .filter((e) => (e.temporada || "1") === activeSeason)
    .sort((a, b) => parseInt(a.episodio || "0") - parseInt(b.episodio || "0"));

  const genres = tmdb?.genres?.length
    ? tmdb.genres.map((g) => (typeof g === "string" ? g : String(g)))
    : (series.genero?.split(",").map((g) => g.trim()).filter(Boolean) || []);

  const backHref = type === "anime" ? "/anime" : "/series";
  const score = tmdb?.voteAverage ?? null;
  const rtScore = score ? ratingToPercent(score) : null;
  const isFresh = rtScore !== null && rtScore >= 60;
  const originalLang = tmdb?.originalLanguage
    ? (LANG_NAMES[tmdb.originalLanguage] || tmdb.originalLanguage.toUpperCase())
    : null;
  const totalSeasons = tmdb?.numberOfSeasons || series.totalSeasons || seasons.length;
  const totalEpisodes = tmdb?.numberOfEpisodes || series.totalEpisodes;

  return (
    <Layout>
      {/* ───── HERO ───── */}
      <div className="relative w-full h-[62vh] md:h-[80vh] -mt-14 md:-mt-16">
        {series.backdropUrl
          ? <img src={series.backdropUrl} alt={series.titulo} className="absolute inset-0 w-full h-full object-cover object-top" />
          : <div className="absolute inset-0 bg-zinc-900" />
        }
        <div className="absolute inset-0 bg-gradient-to-r from-black/97 via-black/65 to-black/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />

        {/* Back */}
        <div className="absolute top-16 md:top-20 left-4 md:left-10 z-10">
          <Link href={backHref} className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-sm font-medium transition-colors bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
            <ChevronLeft className="w-4 h-4" /> {type === "anime" ? "Anime" : "Series"}
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <div className="max-w-screen-2xl mx-auto px-4 md:px-10 lg:px-16 xl:px-20 pb-8 md:pb-14">

            {/* Quality + content rating badges */}
            <div className="flex items-center gap-2 mb-3">
              {tmdb?.contentRating && (
                <span className="text-xs font-bold px-2 py-0.5 border border-white/50 text-white/80 rounded">
                  {tmdb.contentRating}
                </span>
              )}
              <span className="text-[10px] font-black px-2 py-0.5 bg-[#A855F7] text-white rounded tracking-wider">4K</span>
              <span className="text-[10px] font-black px-2 py-0.5 bg-white/10 border border-white/20 text-white/80 rounded tracking-wider">HDR</span>
              <span className="text-[10px] font-black px-2 py-0.5 bg-white/10 border border-white/20 text-white/80 rounded tracking-wider">5.1</span>
            </div>

            {series.logoUrl ? (
              <img
                src={series.logoUrl}
                alt={series.titulo}
                className="max-h-20 md:max-h-32 max-w-[240px] md:max-w-[420px] object-contain object-left mb-4 drop-shadow-[0_2px_24px_rgba(0,0,0,1)]"
              />
            ) : (
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold font-display text-white uppercase tracking-tight mb-3 drop-shadow-lg leading-none">
                {series.titulo}
              </h1>
            )}

            {/* Tagline */}
            {tmdb?.tagline && (
              <p className="text-white/50 italic text-sm md:text-base mb-3 font-light tracking-wide">
                "{tmdb.tagline}"
              </p>
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-2 md:gap-3 text-sm text-white/70 mb-4 font-medium">
              {score !== null && (
                <span className="flex items-center gap-1 text-yellow-400 font-bold text-base">
                  <Star className="w-4 h-4 fill-current" />
                  {score.toFixed(1)}
                  {tmdb?.voteCount && (
                    <span className="text-white/30 text-xs font-normal ml-0.5">({tmdb.voteCount.toLocaleString()})</span>
                  )}
                </span>
              )}
              <span className="text-white/20">|</span>
              {series.año && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-white/40" /> {series.año}
                </span>
              )}
              <span className="flex items-center gap-1">
                <ListVideo className="w-3.5 h-3.5 text-white/40" />
                {totalSeasons} {totalSeasons === 1 ? "Temporada" : "Temporadas"}
              </span>
              {tmdb?.runtime && (
                <span className="flex items-center gap-1 text-white/50">
                  ~{tmdb.runtime}min / ep
                </span>
              )}
              {originalLang && (
                <span className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-white/40" /> {originalLang}
                </span>
              )}
              {genres.length > 0 && (
                <span className="text-white/40 hidden sm:inline">{genres.slice(0, 3).join(" · ")}</span>
              )}
            </div>

            {series.sinopsis && (
              <p className="text-white/75 text-sm md:text-base leading-relaxed max-w-xl mb-4 line-clamp-2">
                {series.sinopsis}
              </p>
            )}

            {/* Creator pill */}
            {tmdb?.createdBy && tmdb.createdBy.length > 0 && (
              <p className="text-white/40 text-xs mb-4">
                <span className="text-white/25">Creador: </span>
                <span className="text-white/65 font-semibold">{tmdb.createdBy.join(", ")}</span>
              </p>
            )}

            {/* Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              {seasonEpisodes.length > 0 && (
                <Link href={`/watch/${type}/${series.id}`}>
                  <button className="flex items-center gap-2 px-7 md:px-9 py-3 bg-white hover:bg-[#A855F7] text-black hover:text-white font-bold rounded-lg text-sm transition-all duration-200 shadow-lg shadow-black/40">
                    <Play className="w-5 h-5 fill-current" /> Ver Episodio 1
                  </button>
                </Link>
              )}

              <button
                onClick={() => toggle({
                  id: series.id, titulo: series.titulo, tipo: type as "serie" | "anime",
                  posterUrl: series.posterUrl ?? null, backdropUrl: series.backdropUrl ?? null,
                  año: series.año ?? "", categoria: type as "serie" | "anime",
                })}
                className={`flex items-center gap-2 px-5 py-3 rounded-lg border font-bold text-sm transition-all duration-200 ${favorited ? "bg-white/90 text-black border-white" : "bg-black/40 text-white border-white/30 hover:border-white backdrop-blur-sm"}`}
              >
                <Heart className={`w-4 h-4 ${favorited ? "fill-current" : ""}`} />
                {favorited ? "En Mi Lista" : "Mi Lista"}
              </button>

              {trailerVideo && (
                <button
                  onClick={() => setTrailerKey(trailerVideo.key)}
                  className="flex items-center gap-2 px-5 py-3 rounded-lg border border-white/25 bg-black/40 hover:border-white/60 text-white font-bold text-sm transition-all backdrop-blur-sm"
                >
                  <PlayCircle className="w-4 h-4" /> Trailer
                </button>
              )}

              {tmdb?.imdbId && (
                <a
                  href={`https://www.imdb.com/title/${tmdb.imdbId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 font-bold text-xs transition-all backdrop-blur-sm"
                >
                  <span className="font-black text-sm">IMDb</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ───── LOWER CONTENT ───── */}
      <div className="max-w-screen-2xl mx-auto px-4 md:px-10 lg:px-16 xl:px-20 py-10 space-y-14">

        {/* ── RATINGS + POSTER + INFO ── */}
        <section className="flex flex-col md:flex-row gap-8 md:gap-10">
          {series.posterUrl && (
            <div className="flex-shrink-0 w-36 md:w-48 lg:w-56 self-start">
              <div className="rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                <img src={series.posterUrl} alt={series.titulo} className="w-full object-cover" />
              </div>
              {/* Network logos */}
              {tmdb?.networks && tmdb.networks.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {tmdb.networks.slice(0, 3).map((n, i) =>
                    n.logoPath ? (
                      <img key={i} src={n.logoPath} alt={n.name} className="h-5 object-contain opacity-60 hover:opacity-100 transition-opacity" />
                    ) : (
                      <span key={i} className="text-[10px] text-white/40 font-semibold">{n.name}</span>
                    )
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex-1 space-y-7">

            {/* Rating badges */}
            <div className="flex flex-wrap gap-3 items-stretch">
              {score !== null && (
                <div className="flex flex-col items-center justify-center bg-zinc-900 border border-yellow-500/30 rounded-xl px-5 py-3 min-w-[80px]">
                  <div className="flex items-center gap-1 mb-0.5">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-yellow-400 font-black text-xl leading-none">{score.toFixed(1)}</span>
                  </div>
                  <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest">TMDb</span>
                  {tmdb?.voteCount && <span className="text-white/20 text-[9px] mt-0.5">{(tmdb.voteCount / 1000).toFixed(0)}K votos</span>}
                </div>
              )}

              {rtScore !== null && (
                <div className="flex flex-col items-center justify-center bg-zinc-900 border border-white/10 rounded-xl px-5 py-3 min-w-[80px]">
                  <span className={`text-2xl font-black leading-none mb-0.5 ${isFresh ? "text-green-400" : "text-red-400"}`}>
                    {isFresh ? "🍅" : "💀"} {rtScore}%
                  </span>
                  <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest">
                    {isFresh ? "Fresco" : "Podrido"}
                  </span>
                </div>
              )}

              <div className="flex flex-col gap-1.5 justify-center">
                <div className="flex gap-2">
                  <span className="flex items-center gap-1 text-[11px] font-black px-3 py-1.5 bg-gradient-to-r from-[#A855F7] to-[#b20710] text-white rounded-lg tracking-wider shadow-sm shadow-[#A855F7]/30">
                    <Video className="w-3 h-3" /> 4K UHD
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-black px-3 py-1.5 bg-zinc-800 border border-white/15 text-white/80 rounded-lg tracking-wider">
                    HDR10+
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="text-[11px] font-bold px-3 py-1.5 bg-zinc-800 border border-white/15 text-white/70 rounded-lg tracking-wider">
                    Dolby 5.1
                  </span>
                  <span className="text-[11px] font-bold px-3 py-1.5 bg-zinc-800 border border-white/15 text-white/70 rounded-lg tracking-wider">
                    CC
                  </span>
                </div>
              </div>

              {score !== null && score >= 7.5 && (
                <div className="flex flex-col items-center justify-center bg-gradient-to-br from-yellow-900/40 to-zinc-900 border border-yellow-500/30 rounded-xl px-5 py-3 min-w-[80px]">
                  <Award className="w-6 h-6 text-yellow-400 mb-1" />
                  <span className="text-yellow-400/80 text-[10px] font-bold uppercase tracking-widest text-center">Top Valorado</span>
                </div>
              )}
            </div>

            {/* Tagline */}
            {tmdb?.tagline && (
              <p className="text-white/40 italic text-sm border-l-2 border-[#A855F7]/50 pl-3">
                "{tmdb.tagline}"
              </p>
            )}

            {/* Synopsis */}
            {series.sinopsis && (
              <div>
                <h2 className="text-[11px] font-bold font-display uppercase tracking-[0.2em] text-white/30 mb-2">Sinopsis</h2>
                <p className="text-white/80 leading-relaxed text-sm md:text-base">{series.sinopsis}</p>
              </div>
            )}

            {/* Genres */}
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {genres.map((g, i) => (
                  <span key={i} className="text-xs font-semibold px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-white/60 hover:border-[#A855F7]/50 hover:text-white transition-colors">
                    {g}
                  </span>
                ))}
              </div>
            )}

            <StreamingPlatforms contentId={series.id} count={4} />
          </div>
        </section>

        {/* ── FICHA TÉCNICA ── */}
        {(tmdb?.createdBy?.length || tmdb?.spokenLanguages?.length || tmdb?.productionCountries?.length || tmdb?.status || tmdb?.networks?.length || tmdb?.numberOfSeasons) && (
          <section>
            <h2 className="text-[11px] font-bold font-display uppercase tracking-[0.2em] text-white/30 mb-5 pb-3 border-b border-white/5">
              Ficha Técnica
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-5">

              {tmdb?.createdBy && tmdb.createdBy.length > 0 && (
                <div className="flex gap-3">
                  <Film className="w-4 h-4 text-[#A855F7] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-0.5">Creador</p>
                    <p className="text-white/80 text-sm font-semibold">{tmdb.createdBy.join(", ")}</p>
                  </div>
                </div>
              )}

              {tmdb?.numberOfSeasons && (
                <div className="flex gap-3">
                  <ListVideo className="w-4 h-4 text-[#A855F7] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-0.5">Temporadas</p>
                    <p className="text-white/80 text-sm font-semibold">
                      {tmdb.numberOfSeasons} temporadas
                      {totalEpisodes ? ` · ${totalEpisodes} episodios` : ""}
                    </p>
                  </div>
                </div>
              )}

              {tmdb?.networks && tmdb.networks.length > 0 && (
                <div className="flex gap-3">
                  <Tv className="w-4 h-4 text-[#A855F7] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-0.5">Cadena</p>
                    <p className="text-white/80 text-sm">{tmdb.networks.map((n) => n.name).join(", ")}</p>
                  </div>
                </div>
              )}

              {tmdb?.spokenLanguages && tmdb.spokenLanguages.length > 0 && (
                <div className="flex gap-3">
                  <Mic2 className="w-4 h-4 text-[#A855F7] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-0.5">Idiomas</p>
                    <p className="text-white/80 text-sm">{tmdb.spokenLanguages.slice(0, 4).join(", ")}</p>
                  </div>
                </div>
              )}

              {tmdb?.spokenLanguages && tmdb.spokenLanguages.length > 0 && (
                <div className="flex gap-3">
                  <Subtitles className="w-4 h-4 text-[#A855F7] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-0.5">Subtitulos</p>
                    <p className="text-white/80 text-sm">Español · Inglés · Portugués</p>
                  </div>
                </div>
              )}

              {tmdb?.productionCountries && tmdb.productionCountries.length > 0 && (
                <div className="flex gap-3">
                  <Globe className="w-4 h-4 text-[#A855F7] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-0.5">Pais de Produccion</p>
                    <p className="text-white/80 text-sm">{tmdb.productionCountries.slice(0, 3).join(", ")}</p>
                  </div>
                </div>
              )}

              {tmdb?.status && (
                <div className="flex gap-3">
                  <ChevronRight className="w-4 h-4 text-[#A855F7] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-0.5">Estado</p>
                    <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${tmdb.status === "Ended" || tmdb.status === "Canceled" ? "text-red-400" : "text-green-400"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${tmdb.status === "Ended" || tmdb.status === "Canceled" ? "bg-red-400" : "bg-green-400"}`} />
                      {tmdb.status === "Returning Series" ? "En emisión" : tmdb.status === "Ended" ? "Finalizada" : tmdb.status === "Canceled" ? "Cancelada" : tmdb.status}
                    </span>
                  </div>
                </div>
              )}

              {tmdb?.runtime && (
                <div className="flex gap-3">
                  <User className="w-4 h-4 text-[#A855F7] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-0.5">Duracion por Episodio</p>
                    <p className="text-white/80 text-sm">~{tmdb.runtime} minutos</p>
                  </div>
                </div>
              )}

              {tmdb?.imdbId && (
                <div className="flex gap-3">
                  <Star className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-0.5">IMDb</p>
                    <a
                      href={`https://www.imdb.com/title/${tmdb.imdbId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-yellow-400 text-sm font-semibold hover:text-yellow-300 flex items-center gap-1 transition-colors"
                    >
                      {tmdb.imdbId} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── EPISODES ── */}
        <section>
          <div className="flex items-center justify-between pb-4 mb-2 border-b border-white/8">
            <h2 className="text-[11px] font-bold font-display uppercase tracking-[0.2em] text-white/30">
              Temporada {activeSeason}
            </h2>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {seasons.map((s) => (
                <button
                  key={s}
                  onClick={() => setActiveSeason(s)}
                  className={`px-4 py-1.5 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${
                    activeSeason === s
                      ? "bg-[#A855F7] text-white shadow-lg shadow-[#A855F7]/30"
                      : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  T{s}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-white/5">
            {seasonEpisodes.map((ep, idx) => (
              <Link
                key={idx}
                href={`/watch/${type}/${series.id}`}
                className="group flex items-center gap-4 py-3 px-2 hover:bg-white/4 rounded-lg transition-colors cursor-pointer"
              >
                <span className="w-8 text-center text-white/25 text-sm font-mono flex-shrink-0 group-hover:text-[#A855F7] transition-colors">
                  {ep.episodio}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-white/80 font-medium text-sm group-hover:text-white transition-colors truncate">
                    {ep.tituloEpisodio || `Episodio ${ep.episodio}`}
                  </p>
                </div>
                <div className="w-7 h-7 rounded-full border border-white/10 group-hover:border-[#A855F7] group-hover:bg-[#A855F7]/10 flex items-center justify-center flex-shrink-0 transition-all">
                  <Play className="w-3 h-3 text-white/30 group-hover:text-[#A855F7] fill-current transition-colors" />
                </div>
              </Link>
            ))}
            {seasonEpisodes.length === 0 && (
              <div className="py-12 text-center text-white/30 text-sm">
                No hay episodios disponibles para esta temporada.
              </div>
            )}
          </div>
        </section>

        {/* ── CAST ── */}
        {cast.length > 0 && (
          <section>
            <h2 className="text-[11px] font-bold font-display uppercase tracking-[0.2em] text-white/30 mb-5 pb-3 border-b border-white/5">
              Reparto Principal
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
              {cast.map((actor, i) => (
                <button
                  key={i}
                  onClick={() => actor.personId ? setSelectedActorId(actor.personId) : undefined}
                  className={`flex-shrink-0 w-28 text-center group ${actor.personId ? "cursor-pointer" : "cursor-default"}`}
                >
                  <div className="relative mx-auto mb-2 w-20 h-20">
                    {actor.profilePath ? (
                      <img
                        src={actor.profilePath}
                        alt={actor.name}
                        className="w-20 h-20 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-[#A855F7]/70 transition-all duration-200"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center text-white/30 text-xl font-bold">
                        {actor.name.charAt(0)}
                      </div>
                    )}
                    {actor.personId && (
                      <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold uppercase tracking-wide">Ver bio</span>
                      </div>
                    )}
                  </div>
                  <p className="text-white text-xs font-semibold leading-tight line-clamp-2">{actor.name}</p>
                  {actor.character && <p className="text-white/35 text-[11px] mt-0.5 leading-tight line-clamp-2 italic">{actor.character}</p>}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ── TRAILER ── */}
        {trailerVideo && (
          <section>
            <h2 className="text-[11px] font-bold font-display uppercase tracking-[0.2em] text-white/30 mb-5 pb-3 border-b border-white/5">
              Trailer Oficial
            </h2>
            <div
              className="relative max-w-2xl rounded-xl overflow-hidden shadow-2xl cursor-pointer group ring-1 ring-white/10 hover:ring-[#A855F7]/50 transition-all"
              onClick={() => setTrailerKey(trailerVideo.key)}
            >
              <img
                src={`https://img.youtube.com/vi/${trailerVideo.key}/maxresdefault.jpg`}
                alt="Trailer"
                className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center group-hover:bg-black/35 transition-colors">
                <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl">
                  <Play className="w-7 h-7 fill-black ml-1" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-white font-semibold text-sm">{trailerVideo.name}</p>
              </div>
            </div>
          </section>
        )}

        {/* ── RECOMMENDATIONS ── */}
        {recommendations.length > 0 && (
          <section>
            <h2 className="text-[11px] font-bold font-display uppercase tracking-[0.2em] text-white/30 mb-5 pb-3 border-b border-white/5">
              Mas Como Esto
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {recommendations.slice(0, 12).map((rec) => (
                <div key={rec.id} className="group cursor-pointer">
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-zinc-900 mb-2 ring-1 ring-white/5 group-hover:ring-[#A855F7]/40 transition-all">
                    {rec.posterPath ? (
                      <img src={rec.posterPath} alt={rec.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-2 text-center">
                        <span className="text-xs text-white/40">{rec.title}</span>
                      </div>
                    )}
                    {rec.voteAverage && (
                      <div className="absolute top-2 right-2 bg-black/80 rounded-md px-1.5 py-0.5 flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 text-yellow-400 fill-current" />
                        <span className="text-[10px] text-white font-bold">{rec.voteAverage.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-white/70 text-xs font-medium line-clamp-2 leading-tight group-hover:text-white transition-colors">{rec.title}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <ActorModal personId={selectedActorId} onClose={() => setSelectedActorId(null)} />
      <TrailerModal videoKey={trailerKey} onClose={() => setTrailerKey(null)} />
    </Layout>
  );
}
