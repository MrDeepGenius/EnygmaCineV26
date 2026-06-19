import { useState } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { Play, Plus, Check, PlayCircle, ThumbsUp, ThumbsDown, Clock, Calendar, Globe, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useGetSeriesDetail, getGetSeriesDetailQueryKey, useGetAnimeDetail, getGetAnimeDetailQueryKey, useGetTmdbDetails, getGetTmdbDetailsQueryKey, useListSeries, useListAnime } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { ActorModal } from "@/components/actor-modal";
import { TrailerModal } from "@/components/trailer-modal";
import { StreamingPlatforms } from "@/components/streaming-platforms";
import { useFavorites } from "@/lib/use-favorites";
import { useProfile } from "@/lib/profile-context";

export default function SeriesDetail() {
  const [, params] = useRoute("/detail/:type/:id");
  const type = params?.type;
  const id = params?.id;
  const [, setLocation] = useLocation();
  const { profile } = useProfile();

  const [activeSeason, setActiveSeason] = useState<string>("1");
  const [selectedActorId, setSelectedActorId] = useState<number | null>(null);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [synopsisExpanded, setSynopsisExpanded] = useState(false);
  const [liked, setLiked] = useState<boolean | null>(null);

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
  const { data: allSeries } = useListSeries({ profile: profile || undefined, limit: 5000 });
  const { data: allAnime } = useListAnime({ profile: profile || undefined, limit: 5000 });

  const { toggle, isFavorite } = useFavorites();

  const data = type === "serie" ? seriesData : animeData;
  const isLoading = type === "serie" ? seriesLoading : animeLoading;

  if (isLoading) {
    return (
      <Layout>
        <div className="w-full h-[55vw] max-h-[480px] min-h-[260px] bg-zinc-900 animate-pulse" />
        <div className="px-4 py-6 space-y-4">
          <div className="h-8 w-1/2 bg-zinc-800 animate-pulse rounded" />
          <div className="h-12 w-3/4 bg-zinc-800 animate-pulse rounded" />
          <div className="h-12 w-full bg-zinc-800 animate-pulse rounded-xl" />
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
  const currentSeason = seasons.includes(activeSeason) ? activeSeason : (seasons[0] || "1");
  const seasonEpisodes = episodes
    .filter((e) => (e.temporada || "1") === currentSeason)
    .sort((a, b) => parseInt(a.episodio || "0") - parseInt(b.episodio || "0"));

  const genres = tmdb?.genres?.length
    ? tmdb.genres.map((g) => (typeof g === "string" ? g : String(g)))
    : (series.genero?.split(",").map((g) => g.trim()).filter(Boolean) || []);

  const score = tmdb?.voteAverage ?? null;

  const runtimeLabel = tmdb?.runtime ? `~${tmdb.runtime}min / ep` : null;
  const totalSeasons = tmdb?.numberOfSeasons || series.totalSeasons || seasons.length;

  const releaseDate = tmdb?.releaseDate
    ? new Date(tmdb.releaseDate).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })
    : series.año || null;

  const country = tmdb?.productionCountries?.[0] || null;
  const sinopsis = series.sinopsis || null;
  const isLongSynopsis = sinopsis && sinopsis.length > 160;
  const backHref = type === "anime" ? "/anime" : "/series";

  const appIds = new Set([
    ...(allSeries?.items || []).map((s) => s.id),
    ...(allAnime?.items || []).map((a) => a.id),
  ]);

  return (
    <Layout>
      {/* ── BACKDROP ── */}
      <div className="relative w-full -mt-14 md:-mt-16" style={{ height: "clamp(260px, 55vw, 480px)" }}>
        {series.backdropUrl
          ? <img src={series.backdropUrl} alt={series.titulo} className="absolute inset-0 w-full h-full object-cover object-top" />
          : <div className="absolute inset-0 bg-zinc-900" />
        }
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/40" />

        {/* Back button */}
        <Link href={backHref}>
          <button className="absolute top-16 md:top-20 left-4 w-9 h-9 rounded-full bg-black/60 backdrop-blur-sm border border-white/15 flex items-center justify-center transition-all hover:bg-black/80">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
        </Link>
      </div>

      {/* ── CONTENT ── */}
      <div className="px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 max-w-screen-md mx-auto">

        {/* Year + rating */}
        <div className="flex items-center gap-2 mt-4 mb-3">
          {series.año && <span className="text-white/50 text-sm font-medium">{series.año}</span>}
          {score !== null && (
            <>
              <span className="text-white/25">•</span>
              <span className="flex items-center gap-1 text-yellow-400 text-sm font-bold">
                <Star className="w-3.5 h-3.5 fill-current" />
                {score.toFixed(1)}
              </span>
            </>
          )}
        </div>

        {/* Logo or title */}
        {series.logoUrl ? (
          <img
            src={series.logoUrl}
            alt={series.titulo}
            className="max-h-16 sm:max-h-20 max-w-[260px] object-contain mb-4 drop-shadow-[0_2px_20px_rgba(0,0,0,1)]"
          />
        ) : (
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-4 leading-tight">
            {series.titulo}
          </h1>
        )}

        {/* Tagline */}
        {tmdb?.tagline && (
          <p className="text-white/40 italic text-sm mb-4">"{tmdb.tagline}"</p>
        )}

        {/* Genres */}
        {genres.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {genres.slice(0, 5).map((g, i) => (
              <span key={i} className="px-3 py-1 rounded-full border border-white/20 text-white/70 text-xs font-semibold">
                {g}
              </span>
            ))}
          </div>
        )}

        {/* VER AHORA */}
        {seasonEpisodes.length > 0 && (
          <Link href={`/watch/${type}/${series.id}`}>
            <button className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#A855F7] hover:bg-[#9333EA] text-white font-bold rounded-2xl text-base transition-all shadow-lg shadow-[#A855F7]/30 mb-3">
              <Play className="w-5 h-5 fill-current" />
              VER AHORA
            </button>
          </Link>
        )}

        {/* Action row */}
        <div className="flex items-center gap-2 mb-7">
          <button
            onClick={() => toggle({
              id: series.id, titulo: series.titulo, tipo: type as "serie" | "anime",
              posterUrl: series.posterUrl ?? null, backdropUrl: series.backdropUrl ?? null,
              año: series.año ?? "", categoria: type as "serie" | "anime",
            })}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/8 hover:bg-white/12 border border-white/10 text-white font-semibold rounded-2xl text-sm transition-all"
          >
            {favorited ? <Check className="w-4 h-4 text-[#A855F7]" /> : <Plus className="w-4 h-4" />}
            Mi lista
          </button>

          {trailerVideo && (
            <button
              onClick={() => setTrailerKey(trailerVideo.key)}
              className="w-12 h-12 flex items-center justify-center bg-white/8 hover:bg-white/12 border border-white/10 rounded-2xl transition-all"
            >
              <PlayCircle className="w-5 h-5 text-white" />
            </button>
          )}

          <button
            onClick={() => setLiked(liked === true ? null : true)}
            className={`w-12 h-12 flex items-center justify-center border rounded-2xl transition-all ${liked === true ? "bg-[#A855F7]/20 border-[#A855F7]/60 text-[#A855F7]" : "bg-white/8 border-white/10 text-white hover:bg-white/12"}`}
          >
            <ThumbsUp className="w-5 h-5" />
          </button>

          <button
            onClick={() => setLiked(liked === false ? null : false)}
            className={`w-12 h-12 flex items-center justify-center border rounded-2xl transition-all ${liked === false ? "bg-red-500/20 border-red-500/60 text-red-400" : "bg-white/8 border-white/10 text-white hover:bg-white/12"}`}
          >
            <ThumbsDown className="w-5 h-5" />
          </button>
        </div>

        {/* Synopsis */}
        {sinopsis && (
          <div className="mb-7">
            <p className={`text-white/75 text-sm leading-relaxed ${!synopsisExpanded && isLongSynopsis ? "line-clamp-3" : ""}`}>
              {sinopsis}
            </p>
            {isLongSynopsis && (
              <button
                onClick={() => setSynopsisExpanded(!synopsisExpanded)}
                className="mt-2 text-[#A855F7] text-sm font-semibold flex items-center gap-1"
              >
                {synopsisExpanded ? "Ver menos" : "Ver más"}
                <ChevronRight className={`w-4 h-4 transition-transform ${synopsisExpanded ? "rotate-90" : ""}`} />
              </button>
            )}
          </div>
        )}

        {/* DISPONIBLE EN */}
        <div className="mb-7">
          <StreamingPlatforms contentId={series.id} count={2} />
        </div>

        {/* Info cards 2×2 */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {(runtimeLabel || totalSeasons) && (
            <div className="bg-white/5 border border-white/8 rounded-2xl p-4">
              <div className="w-8 h-8 rounded-lg bg-[#A855F7]/20 flex items-center justify-center mb-2">
                <Clock className="w-4 h-4 text-[#A855F7]" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-1">Duración</p>
              <p className="text-white font-bold text-sm leading-tight">
                {totalSeasons} {totalSeasons === 1 ? "temp." : "temps."}
                {runtimeLabel && <span className="block text-white/50 font-normal text-xs mt-0.5">{runtimeLabel}</span>}
              </p>
            </div>
          )}
          {releaseDate && (
            <div className="bg-white/5 border border-white/8 rounded-2xl p-4">
              <div className="w-8 h-8 rounded-lg bg-[#A855F7]/20 flex items-center justify-center mb-2">
                <Calendar className="w-4 h-4 text-[#A855F7]" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-1">Estreno</p>
              <p className="text-white font-bold text-sm leading-tight">{releaseDate}</p>
            </div>
          )}
          {country && (
            <div className="bg-white/5 border border-white/8 rounded-2xl p-4">
              <div className="w-8 h-8 rounded-lg bg-[#A855F7]/20 flex items-center justify-center mb-2">
                <Globe className="w-4 h-4 text-[#A855F7]" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-1">País</p>
              <p className="text-white font-bold text-sm leading-tight">{country}</p>
            </div>
          )}
          {score !== null && (
            <div className="bg-white/5 border border-white/8 rounded-2xl p-4">
              <div className="w-8 h-8 rounded-lg bg-[#A855F7]/20 flex items-center justify-center mb-2">
                <Star className="w-4 h-4 text-[#A855F7]" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-1">Puntuación</p>
              <p className="text-white font-bold text-base leading-tight">
                {score.toFixed(1)} <span className="text-white/30 font-normal text-sm">/ 10</span>
              </p>
            </div>
          )}
        </div>

        {/* Elenco */}
        {cast.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-black text-white mb-4">Elenco</h2>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
              {cast.slice(0, 12).map((actor, i) => (
                <button
                  key={i}
                  onClick={() => actor.personId ? setSelectedActorId(actor.personId) : undefined}
                  className="flex-shrink-0 w-20 text-center group"
                >
                  {actor.profilePath ? (
                    <img
                      src={actor.profilePath}
                      alt={actor.name}
                      className="w-16 h-16 rounded-full object-cover mx-auto mb-2 ring-2 ring-white/10 group-hover:ring-[#A855F7]/60 transition-all"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-zinc-800 mx-auto mb-2 flex items-center justify-center text-white/30 text-xl font-bold ring-2 ring-white/8">
                      {actor.name.charAt(0)}
                    </div>
                  )}
                  <p className="text-white/80 text-[11px] font-semibold leading-tight line-clamp-2">{actor.name}</p>
                  {actor.character && (
                    <p className="text-white/35 text-[10px] mt-0.5 line-clamp-1 italic">{actor.character}</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Episodes */}
        {seasons.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-white">Episodios</h2>
              <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
                {seasons.map((s) => (
                  <button
                    key={s}
                    onClick={() => setActiveSeason(s)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
                      currentSeason === s ? "bg-[#A855F7] text-white" : "bg-white/8 text-white/50 hover:text-white"
                    }`}
                  >
                    T{s}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              {seasonEpisodes.slice(0, 20).map((ep, i) => (
                <Link key={i} href={`/watch/${type}/${series.id}?season=${currentSeason}&ep=${ep.episodio}`}>
                  <div className="flex items-center gap-3 px-4 py-3 bg-white/4 hover:bg-white/8 border border-white/8 rounded-xl transition-all cursor-pointer group">
                    <div className="w-8 h-8 rounded-lg bg-white/8 flex items-center justify-center flex-shrink-0">
                      <span className="text-white/50 text-xs font-bold">{ep.episodio}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/80 text-sm font-medium line-clamp-1 group-hover:text-white transition-colors">
                        {ep.tituloEpisodio || `Episodio ${ep.episodio}`}
                      </p>
                    </div>
                    <Play className="w-4 h-4 text-white/20 group-hover:text-[#A855F7] flex-shrink-0 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Más como esto */}
        {recommendations.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-white">Más como esto</h2>
              <ChevronRight className="w-5 h-5 text-white/30" />
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
              {recommendations.slice(0, 10).map((rec) => (
                <button
                  key={rec.id}
                  onClick={() => setLocation(`/detail/${type}/${rec.id}`)}
                  className="flex-shrink-0 w-36 group text-left"
                >
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-800 mb-2">
                    {rec.posterPath ? (
                      <img src={rec.posterPath} alt={rec.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full bg-zinc-800" />
                    )}
                    {rec.voteAverage && (
                      <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 rounded-full px-2 py-0.5">
                        <Star className="w-2.5 h-2.5 text-yellow-400 fill-current" />
                        <span className="text-white text-[10px] font-bold">{rec.voteAverage.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-white/70 text-[11px] font-medium line-clamp-2 leading-tight">{rec.title}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ActorModal personId={selectedActorId} onClose={() => setSelectedActorId(null)} appIds={appIds} />
      {trailerKey && <TrailerModal videoKey={trailerKey} onClose={() => setTrailerKey(null)} />}
    </Layout>
  );
}
