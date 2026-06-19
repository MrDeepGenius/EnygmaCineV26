import { useState } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { Play, Plus, Check, PlayCircle, ThumbsUp, ThumbsDown, Clock, Calendar, Globe, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useGetMovie, getGetMovieQueryKey, useGetTmdbDetails, getGetTmdbDetailsQueryKey, useListMovies } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { ActorModal } from "@/components/actor-modal";
import { TrailerModal } from "@/components/trailer-modal";
import { StreamingPlatforms } from "@/components/streaming-platforms";
import { useFavorites } from "@/lib/use-favorites";
import { useProfile } from "@/lib/profile-context";

export default function MovieDetail() {
  const [, params] = useRoute("/detail/movie/:id");
  const id = params?.id;
  const [, setLocation] = useLocation();
  const { profile } = useProfile();

  const { data: movie, isLoading } = useGetMovie(id || "", {
    query: { enabled: !!id, queryKey: getGetMovieQueryKey(id || "") },
  });
  const { data: tmdb } = useGetTmdbDetails(
    { tmdbId: id || "", type: "movie" },
    { query: { enabled: !!id, queryKey: getGetTmdbDetailsQueryKey({ tmdbId: id || "", type: "movie" }) } }
  );
  const { data: allMovies } = useListMovies({ profile: profile || undefined, limit: 5000 });

  const { toggle, isFavorite } = useFavorites();
  const [selectedActorId, setSelectedActorId] = useState<number | null>(null);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [synopsisExpanded, setSynopsisExpanded] = useState(false);
  const [liked, setLiked] = useState<boolean | null>(null);

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

  if (!movie) return null;

  const favorited = isFavorite(movie.id);
  const cast = tmdb?.cast || [];
  const recommendations = tmdb?.recommendations || [];
  const trailerVideo = tmdb?.videos?.[0] ?? null;

  const genres = tmdb?.genres?.length
    ? tmdb.genres.map((g) => (typeof g === "string" ? g : String(g)))
    : (movie.genero?.split(",").map((g) => g.trim()).filter(Boolean) || []);

  const score = movie.valoracion ? parseFloat(movie.valoracion) : tmdb?.voteAverage ?? null;

  const runtime = tmdb?.runtime
    ? `${Math.floor(tmdb.runtime / 60)}h ${tmdb.runtime % 60}m`
    : null;

  const releaseDate = tmdb?.releaseDate
    ? new Date(tmdb.releaseDate).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })
    : movie.año || null;

  const country = tmdb?.productionCountries?.[0] || null;

  const sinopsis = movie.sinopsis || tmdb?.overview || null;
  const isLongSynopsis = sinopsis && sinopsis.length > 160;

  const appIds = new Set((allMovies?.items || []).map((m) => m.id));

  return (
    <Layout>
      {/* ── BACKDROP ── */}
      <div className="relative w-full -mt-14 md:-mt-16" style={{ height: "clamp(260px, 55vw, 480px)" }}>
        {movie.backdropUrl
          ? <img src={movie.backdropUrl} alt={movie.titulo} className="absolute inset-0 w-full h-full object-cover object-top" />
          : <div className="absolute inset-0 bg-zinc-900" />
        }
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/40" />

        {/* Back button */}
        <Link href="/movies">
          <button className="absolute top-16 md:top-20 left-4 w-9 h-9 rounded-full bg-black/60 backdrop-blur-sm border border-white/15 flex items-center justify-center transition-all hover:bg-black/80">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
        </Link>
      </div>

      {/* ── CONTENT ── */}
      <div className="px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 max-w-screen-md mx-auto">

        {/* Year + rating */}
        <div className="flex items-center gap-2 mt-4 mb-3">
          {movie.año && <span className="text-white/50 text-sm font-medium">{movie.año}</span>}
          {score !== null && (
            <>
              <span className="text-white/25">•</span>
              <span className="flex items-center gap-1 text-yellow-400 text-sm font-bold">
                <Star className="w-3.5 h-3.5 fill-current" />
                {typeof score === "number" ? score.toFixed(1) : score}
              </span>
            </>
          )}
        </div>

        {/* Logo or title */}
        {movie.logoUrl ? (
          <img
            src={movie.logoUrl}
            alt={movie.titulo}
            className="max-h-16 sm:max-h-20 max-w-[260px] object-contain mb-4 drop-shadow-[0_2px_20px_rgba(0,0,0,1)]"
          />
        ) : (
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-4 leading-tight">
            {movie.titulo}
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
        <Link href={`/watch/movie/${movie.id}`}>
          <button className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#A855F7] hover:bg-[#9333EA] text-white font-bold rounded-2xl text-base transition-all shadow-lg shadow-[#A855F7]/30 mb-3">
            <Play className="w-5 h-5 fill-current" />
            VER AHORA
          </button>
        </Link>

        {/* Action row */}
        <div className="flex items-center gap-2 mb-7">
          <button
            onClick={() => toggle({
              id: movie.id, titulo: movie.titulo, tipo: "movie",
              posterUrl: movie.posterUrl ?? null, backdropUrl: movie.backdropUrl ?? null,
              año: movie.año ?? "", categoria: "movie",
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
          <StreamingPlatforms contentId={movie.id} count={2} />
        </div>

        {/* Info cards 2×2 */}
        {(runtime || releaseDate || country || score) && (
          <div className="grid grid-cols-2 gap-3 mb-8">
            {runtime && (
              <div className="bg-white/5 border border-white/8 rounded-2xl p-4">
                <div className="w-8 h-8 rounded-lg bg-[#A855F7]/20 flex items-center justify-center mb-2">
                  <Clock className="w-4 h-4 text-[#A855F7]" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-1">Duración</p>
                <p className="text-white font-bold text-base leading-tight">{runtime}</p>
              </div>
            )}
            {releaseDate && (
              <div className="bg-white/5 border border-white/8 rounded-2xl p-4">
                <div className="w-8 h-8 rounded-lg bg-[#A855F7]/20 flex items-center justify-center mb-2">
                  <Calendar className="w-4 h-4 text-[#A855F7]" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-1">Estreno</p>
                <p className="text-white font-bold text-base leading-tight">{releaseDate}</p>
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
                  {typeof score === "number" ? score.toFixed(1) : score} <span className="text-white/30 font-normal text-sm">/ 10</span>
                </p>
              </div>
            )}
          </div>
        )}

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
                  onClick={() => setLocation(`/detail/movie/${rec.id}`)}
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
