import { Link } from "wouter";
import { Play, X } from "lucide-react";
import { motion } from "framer-motion";
import { useWatchProgress } from "@/lib/use-watch-progress";

export function ContinueWatchingRow() {
  const { progress, removeProgress } = useWatchProgress();

  if (progress.length === 0) return null;

  return (
    <div className="px-4 md:px-10 lg:px-16 xl:px-20 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-5 bg-[#A855F7] rounded-full" style={{ boxShadow: "0 0 8px #A855F7" }} />
        <h2 className="text-base sm:text-lg font-black font-netflix text-white tracking-tight">Continuar Viendo</h2>
      </div>

      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
        {progress.slice(0, 10).map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative group flex-shrink-0 w-[120px] sm:w-[150px]"
          >
            {/* Card */}
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 border border-white/5 group-hover:border-white/20 transition-all cursor-pointer">
              <Link href={`/watch/${item.tipo}/${item.id}`} className="absolute inset-0 z-20" />

              {item.posterUrl ? (
                <img
                  src={item.posterUrl}
                  alt={item.titulo}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-zinc-800 flex items-center justify-center p-2">
                  <span className="text-white/30 text-xs text-center">{item.titulo}</span>
                </div>
              )}

              {/* Bottom gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

              {/* Red progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/15">
                <div
                  className="h-full bg-[#A855F7] rounded-r-full transition-all duration-300"
                  style={{ width: `${Math.max(5, Math.min(95, item.progress * 100))}%` }}
                />
              </div>

              {/* Hover play */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg hover:bg-[#A855F7] hover:scale-110 transition-all">
                  <Play className="w-4 h-4 fill-black ml-0.5" />
                </div>
              </div>

              {/* Remove button */}
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeProgress(item.id); }}
                className="absolute top-1.5 right-1.5 z-30 w-5 h-5 rounded-full bg-black/80 text-white/60 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            {/* Info below */}
            <p className="mt-1.5 text-white/70 text-[10px] font-bold line-clamp-1 font-netflix px-0.5">{item.titulo}</p>
            {item.episodio && (
              <p className="text-white/35 text-[9px] px-0.5">Episodio {item.episodio}</p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
