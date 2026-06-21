import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PosterCard } from "./poster-card";
import type { Movie, Series } from "@workspace/api-client-react";

interface HorizontalRowProps {
  title: string;
  items: (Movie | Series)[];
  type: "movie" | "serie" | "anime";
  isNumbered?: boolean;
  variant?: "portrait" | "landscape";
}

export function HorizontalRow({ title, items, type, isNumbered = false, variant = "portrait" }: HorizontalRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  // Si es numbered (Top 10), usar variant "top10"
  const effectiveVariant = isNumbered ? "top10" : variant;

  const scroll = (direction: "left" | "right") => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth + 80 : scrollLeft + clientWidth - 80;
      rowRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="w-full mb-6 relative group/row">
      <h2 className="text-sm md:text-base font-bold mb-2.5 tracking-wide text-white px-4 md:px-10 lg:px-16 xl:px-20">
        {title}
      </h2>

      <div className="relative">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center bg-gradient-to-r from-black to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity z-40 hover:text-[#A855F7]"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div
          ref={rowRef}
          className="flex gap-1.5 md:gap-2 overflow-x-auto scrollbar-hide snap-x pt-1 pb-4 -mt-1 px-4 md:px-10 lg:px-16 xl:px-20"
        >
          {items.map((item, index) => (
            <div key={item.id} className="snap-start flex-shrink-0">
              <PosterCard
                item={item}
                rank={isNumbered ? index + 1 : undefined}
                type={type}
                variant={effectiveVariant}
              />
            </div>
          ))}
        </div>

        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-0 bottom-0 w-10 flex items-center justify-center bg-gradient-to-l from-black to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity z-40 hover:text-[#A855F7]"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
