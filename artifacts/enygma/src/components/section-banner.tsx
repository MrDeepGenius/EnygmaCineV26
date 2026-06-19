import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import type { Movie } from "@workspace/api-client-react";

interface SectionBannerProps {
  items: Movie[];
}

function pickRandom<T>(arr: T[], n: number): T[] {
  if (arr.length === 0) return [];
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
}

export function SectionBanner({ items }: SectionBannerProps) {
  const [, setLocation] = useLocation();

  const featured = useMemo(() => {
    const withLogo = items.filter((i) => i.logoUrl && (i.backdropUrl || i.posterUrl));
    const withBackdrop = items.filter((i) => !i.logoUrl && (i.backdropUrl || i.posterUrl));

    const logoSlots = Math.min(withLogo.length, 5);
    const fillSlots = 5 - logoSlots;

    const picked = [
      ...pickRandom(withLogo, logoSlots),
      ...pickRandom(withBackdrop, fillSlots),
    ].sort(() => Math.random() - 0.5);

    return picked.length > 0 ? picked : pickRandom(items, 5);
  }, [items]);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (featured.length === 0) return;
    setCurrentIndex(0);
  }, [featured]);

  useEffect(() => {
    if (featured.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featured.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featured]);

  if (featured.length === 0) return null;

  const current = featured[currentIndex];
  const rating = (current as any).valoracion;
  const detailType =
    current.categoria === "serie" || current.categoria === "anime"
      ? current.categoria
      : "movie";

  const imageUrl = current.posterUrl || current.backdropUrl;

  const handleClick = () => {
    setLocation(`/detail/${detailType}/${current.id}`);
  };

  return (
    <div
      className="relative w-full cursor-pointer select-none -mt-14 md:-mt-16"
      style={{ height: "100svh" }}
      onClick={handleClick}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={current.titulo}
              className="w-full h-full object-cover object-top"
            />
          ) : (
            <div className="w-full h-full bg-zinc-900" />
          )}

          {/* Top fade */}
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent" />

          {/* Bottom fade — strong, like HBO Max */}
          <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black via-black/80 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content — centered at bottom */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center text-center px-6 pb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -6, opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="flex flex-col items-center w-full"
          >
            {current.logoUrl ? (
              <img
                src={current.logoUrl}
                alt={current.titulo}
                className="max-h-20 max-w-[280px] object-contain drop-shadow-[0_2px_24px_rgba(0,0,0,1)] mb-2"
              />
            ) : (
              <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-wide text-white drop-shadow-lg mb-2 leading-tight">
                {current.titulo}
              </h1>
            )}

            {/* Rating + year */}
            <div className="flex items-center gap-2 text-white/70 text-sm mb-2">
              {rating && <span className="font-semibold text-white">{Number(rating).toFixed(0)}+</span>}
              {rating && current.año && <span className="w-1 h-1 rounded-full bg-white/40 inline-block" />}
              {current.año && <span>{current.año}</span>}
            </div>

            {/* Synopsis */}
            {current.sinopsis && (
              <p className="text-sm text-white/75 line-clamp-3 max-w-xs leading-relaxed mb-4">
                {current.sinopsis}
              </p>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Pagination dots */}
        <div
          className="flex items-center justify-center gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          {featured.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex ? "w-5 bg-white" : "w-1.5 bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
