import { Link } from "wouter";
import { Play, Info, Heart, Star } from "lucide-react";
import { motion } from "framer-motion";
import type { Movie, Series } from "@workspace/api-client-react";
import { useFavorites } from "@/lib/use-favorites";

interface PosterCardProps {
  item: Movie | Series;
  rank?: number;
  type: "movie" | "serie" | "anime";
  variant?: "portrait" | "landscape" | "grid" | "top10";
}

export function PosterCard({ item, rank, type, variant = "portrait" }: PosterCardProps) {
  const isSeries = type === "serie" || type === "anime";
  const { toggle, isFavorite } = useFavorites();
  const favorited = isFavorite(item.id);
  const rating = (item as Movie).valoracion;

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle({
      id: item.id,
      titulo: item.titulo,
      tipo: type,
      posterUrl: item.posterUrl ?? null,
      backdropUrl: item.backdropUrl ?? null,
      año: item.año ?? "",
      categoria: type,
    });
  };

  /* ─── GRID variant: 3-col mobile layout, info below card ─── */
  if (variant === "grid") {
    return (
      <div className="flex flex-col">
        <motion.div
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="relative group rounded-lg overflow-hidden bg-zinc-900 cursor-pointer aspect-[2/3] ring-1 ring-white/5 hover:ring-[#A855F7]/60 shadow-md transition-shadow"
        >
          <Link href={`/detail/${type}/${item.id}`} className="absolute inset-0 z-20" />

          {item.posterUrl ? (
            <img
              src={item.posterUrl}
              alt={item.titulo}
              className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-2 bg-zinc-800">
              <span className="font-bold text-xs text-white/50 text-center leading-tight">{item.titulo}</span>
            </div>
          )}

          {/* Rating badge — always visible */}
          {rating && (
            <div className="absolute top-1.5 right-1.5 z-10 flex items-center gap-0.5 bg-black/75 backdrop-blur-sm rounded px-1.5 py-0.5">
              <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
              <span className="text-[10px] font-bold text-white leading-none">{Number(rating).toFixed(1)}</span>
            </div>
          )}

          {/* Favorite */}
          <button
            onClick={handleFavorite}
            className={`absolute top-1.5 left-1.5 z-30 w-6 h-6 rounded-full backdrop-blur-sm flex items-center justify-center transition-all
              ${favorited ? "bg-black/70 opacity-100" : "bg-black/70 opacity-0 group-hover:opacity-100"}`}
          >
            <Heart className={`w-3 h-3 ${favorited ? "text-[#A855F7] fill-[#A855F7]" : "text-white"}`} />
          </button>

          {/* Hover play overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center z-10">
            <Link href={`/watch/${type}/${item.id}`} className="relative z-30">
              <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-[#A855F7] hover:scale-110 transition-all shadow-lg">
                <Play className="w-4 h-4 fill-black ml-0.5" />
              </div>
            </Link>
          </div>
        </motion.div>

        {/* Info below */}
        <div className="mt-1.5 px-0.5">
          <p className="text-white text-xs font-semibold leading-tight line-clamp-2 font-netflix">
            {item.titulo}
          </p>
          <p className="text-white/40 text-[10px] mt-0.5">{item.año}</p>
        </div>
      </div>
    );
  }

  /* ─── LANDSCAPE variant: 16:9 cinematic ─── */
  if (variant === "landscape") {
    const imageUrl = item.backdropUrl || item.posterUrl;
    return (
      <motion.div
        whileHover={{ scale: 1.04, zIndex: 10 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative group flex-shrink-0 w-[200px] sm:w-[260px] md:w-[300px] aspect-video rounded-lg overflow-hidden bg-zinc-900 cursor-pointer shadow-xl"
      >
        <Link href={`/detail/${type}/${item.id}`} className="absolute inset-0 z-20" />

        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.titulo}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-3 bg-zinc-800">
            <span className="font-bold text-sm text-white/70">{item.titulo}</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        <button
          onClick={handleFavorite}
          className={`absolute top-2 right-2 z-30 w-7 h-7 rounded-full flex items-center justify-center transition-all backdrop-blur-sm
            ${favorited ? "bg-black/70 opacity-100" : "bg-black/70 opacity-0 group-hover:opacity-100"}`}
        >
          <Heart className={`w-3.5 h-3.5 ${favorited ? "text-[#A855F7] fill-[#A855F7]" : "text-white"}`} />
        </button>

        {rank && (
          <div
            className="absolute -left-2 bottom-1 text-[70px] sm:text-[90px] font-bold leading-none tracking-tighter font-display z-10 pointer-events-none select-none"
            style={{
              color: "#A855F7",
              WebkitTextStroke: "2px #000",
              textShadow: "0 0 20px rgba(229,9,20,0.8), 2px 4px 8px rgba(0,0,0,0.9)",
            }}
          >
            {rank}
          </div>
        )}

        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 z-10">
          <h3 className="text-white font-bold text-sm line-clamp-1 mb-1.5 font-netflix">{item.titulo}</h3>
          <div className="flex items-center gap-2">
            <Link href={`/watch/${type}/${item.id}`} className="relative z-30">
              <button className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center hover:bg-[#A855F7] hover:text-white transition-colors">
                <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />
              </button>
            </Link>
            <Link href={`/detail/${type}/${item.id}`} className="relative z-30">
              <button className="w-7 h-7 rounded-full border border-white/50 text-white flex items-center justify-center hover:border-white hover:bg-white/20 transition-colors">
                <Info className="w-3.5 h-3.5" />
              </button>
            </Link>
            <span className="text-white/50 text-xs ml-auto">{item.año}</span>
          </div>
        </div>
      </motion.div>
    );
  }

  /* ─── PORTRAIT variant (default) — Netflix style ─── */
  if (variant === "top10") {
    return (
      <motion.div
        whileHover={{ scale: 1.06, zIndex: 10 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="relative group flex-shrink-0 w-[140px] sm:w-[170px] md:w-[200px] lg:w-[220px] aspect-[2/3] rounded-md overflow-hidden bg-zinc-900 cursor-pointer shadow-lg"
      >
        <Link href={`/detail/${type}/${item.id}`} className="absolute inset-0 z-20" />

        {item.posterUrl ? (
          <img
            src={item.posterUrl}
            alt={item.titulo}
            className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-2 bg-zinc-800">
            <span className="font-bold text-xs text-white/50 text-center leading-tight">{item.titulo}</span>
          </div>
        )}

        {/* Subtle gradient at bottom always */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

        {/* Favorite button */}
        <button
          onClick={handleFavorite}
          className={`absolute top-2 right-2 z-30 w-7 h-7 rounded-full backdrop-blur-sm flex items-center justify-center transition-all
            ${favorited ? "bg-black/70 opacity-100" : "bg-black/70 opacity-0 group-hover:opacity-100"}`}
        >
          <Heart className={`w-3.5 h-3.5 ${favorited ? "text-[#A855F7] fill-[#A855F7]" : "text-white"}`} />
        </button>

        {/* Rank number — bigger for top 10 */}
        {rank && (
          <div
            className="absolute -left-3 -bottom-2 text-[120px] sm:text-[140px] md:text-[160px] font-bold leading-none tracking-tighter font-display z-10 pointer-events-none select-none"
            style={{
              color: "#A855F7",
              WebkitTextStroke: "3px #000",
              textShadow: "0 0 30px rgba(168,85,247,0.8), 4px 8px 16px rgba(0,0,0,0.95)",
            }}
          >
            {rank}
          </div>
        )}

        {/* Hover overlay — play + info */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-2 z-10">
          <h3 className="text-white font-semibold text-[11px] sm:text-xs line-clamp-2 mb-2 leading-tight">{item.titulo}</h3>
          <div className="flex items-center gap-2">
            <Link href={`/watch/${type}/${item.id}`} className="relative z-30">
              <button className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center hover:bg-[#A855F7] hover:text-white transition-colors">
                <Play className="w-3 h-3 ml-px fill-current" />
              </button>
            </Link>
            <Link href={`/detail/${type}/${item.id}`} className="relative z-30">
              <button className="w-7 h-7 rounded-full border border-white/50 text-white flex items-center justify-center hover:border-white hover:bg-white/10 transition-colors">
                <Info className="w-3 h-3" />
              </button>
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  /* ─── PORTRAIT variant (default) — Netflix style ─── */
  return (
    <motion.div
      whileHover={{ scale: 1.06, zIndex: 10 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="relative group flex-shrink-0 w-[120px] sm:w-[150px] md:w-[170px] lg:w-[190px] aspect-[2/3] rounded-md overflow-hidden bg-zinc-900 cursor-pointer shadow-lg"
    >
      <Link href={`/detail/${type}/${item.id}`} className="absolute inset-0 z-20" />

      {item.posterUrl ? (
        <img
          src={item.posterUrl}
          alt={item.titulo}
          className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-110"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center p-2 bg-zinc-800">
          <span className="font-bold text-xs text-white/50 text-center leading-tight">{item.titulo}</span>
        </div>
      )}

      {/* Subtle gradient at bottom always */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      {/* Favorite button */}
      <button
        onClick={handleFavorite}
        className={`absolute top-1 right-1 z-30 w-6 h-6 rounded-full backdrop-blur-sm flex items-center justify-center transition-all
          ${favorited ? "bg-black/70 opacity-100" : "bg-black/70 opacity-0 group-hover:opacity-100"}`}
      >
        <Heart className={`w-3 h-3 ${favorited ? "text-[#A855F7] fill-[#A855F7]" : "text-white"}`} />
      </button>

      {/* Rank number */}
      {rank && (
        <div
          className="absolute -left-1 bottom-0 text-[64px] sm:text-[80px] font-bold leading-none tracking-tighter font-display z-10 pointer-events-none select-none"
          style={{
            color: "#A855F7",
            WebkitTextStroke: "2px #000",
            textShadow: "2px 4px 8px rgba(0,0,0,0.9)",
          }}
        >
          {rank}
        </div>
      )}

      {/* Hover overlay — play + info */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-2 z-10">
        <h3 className="text-white font-semibold text-[10px] sm:text-xs line-clamp-2 mb-1.5 leading-tight">{item.titulo}</h3>
        <div className="flex items-center gap-1.5">
          <Link href={`/watch/${type}/${item.id}`} className="relative z-30">
            <button className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center hover:bg-[#A855F7] hover:text-white transition-colors">
              <Play className="w-2.5 h-2.5 ml-px fill-current" />
            </button>
          </Link>
          <Link href={`/detail/${type}/${item.id}`} className="relative z-30">
            <button className="w-6 h-6 rounded-full border border-white/50 text-white flex items-center justify-center hover:border-white hover:bg-white/10 transition-colors">
              <Info className="w-2.5 h-2.5" />
            </button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
