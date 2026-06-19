import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface BannerItem {
  id: string;
  titulo: string;
  sinopsis: string | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  logoUrl: string | null;
  año?: string | null;
  valoracion?: string | null;
  categoria: string;
}

interface SectionBannerProps {
  category: "movie" | "serie" | "anime";
  profile?: string;
}

async function fetchBannerItems(category: string, profile?: string): Promise<BannerItem[]> {
  const params = new URLSearchParams({ category });
  if (profile) params.set("profile", profile);
  const res = await fetch(`${BASE}/api/content/banner?${params}`);
  if (!res.ok) return [];
  return res.json();
}

export function SectionBanner({ category, profile }: SectionBannerProps) {
  const [, setLocation] = useLocation();
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: items = [] } = useQuery<BannerItem[]>({
    queryKey: ["section-banner", category, profile],
    queryFn: () => fetchBannerItems(category, profile),
    staleTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    setCurrentIndex(0);
  }, [items]);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [items]);

  if (items.length === 0) return null;

  const current = items[currentIndex];
  const detailType =
    current.categoria === "serie" || current.categoria === "anime"
      ? current.categoria
      : "movie";

  const imageUrl = current.backdropUrl || current.posterUrl;
  const rating = current.valoracion;

  const handleClick = () => {
    setLocation(`/detail/${detailType}/${current.id}`);
  };

  return (
    <div
      className="relative w-full cursor-pointer select-none overflow-hidden"
      style={{ height: "clamp(280px, 58vw, 560px)" }}
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
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/50 to-transparent" />

          {/* Bottom fade — strong */}
          <div className="absolute inset-x-0 bottom-0 h-[65%] bg-gradient-to-t from-black via-black/75 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center text-center px-4 pb-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -6, opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="flex flex-col items-center w-full"
          >
            {/* Logo original o título */}
            {current.logoUrl ? (
              <img
                src={current.logoUrl}
                alt={current.titulo}
                className="max-h-16 sm:max-h-24 max-w-[260px] sm:max-w-[380px] object-contain drop-shadow-[0_2px_24px_rgba(0,0,0,1)] mb-2"
              />
            ) : (
              <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-wide text-white drop-shadow-lg mb-2 leading-tight">
                {current.titulo}
              </h2>
            )}

            {/* Rating + año */}
            <div className="flex items-center gap-2 text-white/70 text-sm mb-1.5">
              {rating && (
                <span className="font-semibold text-white">{Number(rating).toFixed(0)}+</span>
              )}
              {rating && current.año && (
                <span className="w-1 h-1 rounded-full bg-white/40 inline-block" />
              )}
              {current.año && <span>{current.año}</span>}
            </div>

            {/* Sinopsis */}
            {current.sinopsis && (
              <p className="text-xs sm:text-sm text-white/75 line-clamp-3 max-w-xs sm:max-w-md leading-relaxed mb-3">
                {current.sinopsis}
              </p>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div
          className="flex items-center justify-center gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          {items.map((_, idx) => (
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
