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

  const scroll = (direction: "left" | "right") => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth + 100 : scrollLeft + clientWidth - 100;
      rowRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="w-full mb-10 sm:mb-14 relative group/row px-4 md:px-10 lg:px-16 xl:px-20">
      <h2 className="text-lg md:text-xl lg:text-2xl font-bold mb-4 font-display tracking-wide text-white">
        {title}
      </h2>

      <div className="relative">
        <button
          onClick={() => scroll("left")}
          className="absolute -left-4 md:-left-10 lg:-left-16 xl:-left-20 top-0 bottom-0 w-14 flex items-center justify-center bg-gradient-to-r from-black to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity z-40 hover:text-[#A855F7]"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>

        <div
          ref={rowRef}
          className="flex gap-2 md:gap-3 overflow-x-auto scrollbar-hide snap-x pt-2 pb-8 -mt-2"
        >
          {items.map((item, index) => (
            <div key={item.id} className="snap-start">
              <PosterCard
                item={item}
                rank={isNumbered ? index + 1 : undefined}
                type={type}
                variant={variant}
              />
            </div>
          ))}
        </div>

        <button
          onClick={() => scroll("right")}
          className="absolute -right-4 md:-right-10 lg:-right-16 xl:-right-20 top-0 bottom-0 w-14 flex items-center justify-center bg-gradient-to-l from-black to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity z-40 hover:text-[#A855F7]"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
}
