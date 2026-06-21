import { useRoute } from "wouter";
import { AlertCircle } from "lucide-react";
import {
  useGetMovie,
  useGetSeriesDetail,
  useGetAnimeDetail,
  useResolveVideo,
  getGetMovieQueryKey,
  getGetSeriesDetailQueryKey,
  getGetAnimeDetailQueryKey,
  getResolveVideoQueryKey,
} from "@workspace/api-client-react";
import { useState, useEffect } from "react";
import { VideoPlayer } from "@/components/video-player";
import { useWatchProgress } from "@/lib/use-watch-progress";
import { useAnalytics } from "@/lib/use-analytics";

function toEmbedUrl(url: string): string {
  if (!url) return "";
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com") && u.searchParams.get("v"))
      return `https://www.youtube.com/embed/${u.searchParams.get("v")}?autoplay=1`;
    if (u.hostname === "youtu.be")
      return `https://www.youtube.com/embed${u.pathname}?autoplay=1`;
    if (u.hostname === "ok.ru" && u.pathname.startsWith("/video/"))
      return `https://ok.ru/videoembed/${u.pathname.replace("/video/", "")}`;
  } catch { /* invalid URL */ }
  return url;
}

// Sites we can extract HLS from
function canExtract(url: string): boolean {
  if (!url) return false;
  try {
    const h = new URL(url).hostname;
    return h.includes("vimeos.net") || h.includes("streamwish") || h.includes("goodstream") || h.includes("waaw");
  } catch { return false; }
}

export default function Watch() {
  const [, params] = useRoute("/watch/:category/:id");
  const category = params?.category;
  const id = params?.id;
  const [selectedEpisode, setSelectedEpisode] = useState(0);
  const { addProgress, getProgress } = useWatchProgress();
  const { trackContent } = useAnalytics();

  const { data: movie } = useGetMovie(id || "", {
    query: { enabled: category === "movie" && !!id, queryKey: getGetMovieQueryKey(id || "") },
  });
  const { data: series } = useGetSeriesDetail(id || "", {
    query: { enabled: category === "serie" && !!id, queryKey: getGetSeriesDetailQueryKey(id || "") },
  });
  const { data: anime } = useGetAnimeDetail(id || "", {
    query: { enabled: category === "anime" && !!id, queryKey: getGetAnimeDetailQueryKey(id || "") },
  });

  let rawUrl = "";
  let title = "";
  let posterUrl = "";
  let backdropUrl = "";
  let año = "";
  let logoUrl = "";

  if (category === "movie" && movie) {
    rawUrl = movie.urlReproduccion || "";
    title = movie.titulo;
    posterUrl = movie.posterUrl || "";
    backdropUrl = movie.backdropUrl || "";
    año = movie.año || "";
    logoUrl = (movie as { logoUrl?: string }).logoUrl || "";
  } else if ((category === "serie" || category === "anime") && (series || anime)) {
    const d = category === "serie" ? series : anime;
    const ep = d?.episodes?.[selectedEpisode];
    rawUrl = ep?.urlReproduccion || d?.episodes?.[0]?.urlReproduccion || "";
    title = d?.series?.titulo || "";
    posterUrl = d?.series?.posterUrl || "";
    backdropUrl = d?.series?.backdropUrl || "";
    año = d?.series?.año || "";
    logoUrl = (d?.series as { logoUrl?: string })?.logoUrl || "";
  }

  // Save watch progress when content title is known
  useEffect(() => {
    if (!id || !title || !category) return;
    const existing = getProgress(id);
    addProgress({
      id: id,
      titulo: title,
      tipo: category as "movie" | "serie" | "anime",
      posterUrl: posterUrl || null,
      backdropUrl: backdropUrl || null,
      año: año,
      progress: existing?.progress ?? 0.05,
      episodio: selectedEpisode > 0 ? selectedEpisode + 1 : undefined,
    });
    
    // Track content being watched
    trackContent(id, title, category as "movie" | "serie" | "anime");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, title, category, selectedEpisode]);

  const shouldResolve = canExtract(rawUrl);

  const { data: resolved, isLoading: resolving, isError: resolveFailed } = useResolveVideo(
    { url: rawUrl },
    { query: { enabled: shouldResolve && !!rawUrl, queryKey: getResolveVideoQueryKey({ url: rawUrl }) } }
  );

  const episodes = category === "serie" ? series?.episodes : category === "anime" ? anime?.episodes : null;
  const episodeButtons = episodes?.map((ep, idx) => ({
    label: ep.episodio ? `E${ep.episodio}` : `Ep ${idx + 1}`,
    active: selectedEpisode === idx,
    onSelect: () => setSelectedEpisode(idx),
  }));

  const goBack = () => history.back();

  // Still loading data
  if (!rawUrl && (category === "movie" ? !movie : !(series || anime))) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-[200]">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-4 border-white/10" />
          <div className="absolute inset-0 rounded-full border-4 border-[#A855F7] border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  // No URL at all
  if (!rawUrl) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center gap-4 z-[200] text-center px-8">
        <AlertCircle className="w-16 h-16 text-[#A855F7]" />
        <h2 className="text-white text-2xl font-bold">Sin URL de reproducción</h2>
        <button onClick={goBack} className="mt-2 px-6 py-2 bg-[#A855F7] text-white rounded font-bold">
          Volver
        </button>
      </div>
    );
  }

  // Native HLS player for vimeos.net and similar
  if (shouldResolve) {
    if (resolving) {
      return (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center gap-5 z-[200]">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-4 border-white/10" />
            <div className="absolute inset-0 rounded-full border-4 border-[#A855F7] border-t-transparent animate-spin" />
          </div>
          <p className="text-white/50 text-sm uppercase tracking-widest">Cargando reproductor</p>
        </div>
      );
    }

    if (resolveFailed || !resolved?.hlsUrl) {
      return (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center gap-4 z-[200] text-center px-8">
          <AlertCircle className="w-16 h-16 text-[#A855F7]" />
          <h2 className="text-white text-2xl font-bold">Contenido no disponible</h2>
          <p className="text-white/50">No se pudo cargar este video. Intenta más tarde.</p>
          <button onClick={goBack} className="mt-2 px-6 py-2 bg-[#A855F7] text-white rounded font-bold">
            Volver
          </button>
        </div>
      );
    }

    const proxiedHlsUrl = `/api/hls-proxy?url=${encodeURIComponent(resolved.hlsUrl)}`;

    return (
      <VideoPlayer
        hlsUrl={proxiedHlsUrl}
        title={title}
        logoUrl={logoUrl || undefined}
        originalUrl={rawUrl || undefined}
        onBack={goBack}
        episodes={episodeButtons}
      />
    );
  }

  // Fallback iframe for YouTube, ok.ru, etc.
  const embedUrl = toEmbedUrl(rawUrl);
  return (
    <div className="fixed inset-0 z-[200] bg-black">
      <button
        onClick={goBack}
        className="absolute top-4 left-4 z-50 p-2 rounded-full bg-black/60 text-white hover:bg-[#A855F7] transition-colors"
      >
        ←
      </button>
      <iframe
        key={embedUrl}
        src={embedUrl}
        className="w-full h-full border-0"
        allowFullScreen
        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
        sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-pointer-lock allow-fullscreen"
      />
    </div>
  );
}
