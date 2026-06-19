import { useListSeries } from "@workspace/api-client-react";
import { useProfile } from "@/lib/profile-context";
import { Layout } from "@/components/layout";
import { PosterCard } from "@/components/poster-card";
import { useState } from "react";
import type { Series } from "@workspace/api-client-react";

const PAGE_SIZE = 60;

export default function SeriesPage() {
  const { profile } = useProfile();
  const [search, setSearch] = useState("");
  const [displayLimit, setDisplayLimit] = useState(PAGE_SIZE);

  const { data, isLoading } = useListSeries({
    profile: profile || undefined,
    search: search || undefined,
    limit: 2000,
  });

  const allItems: Series[] = data?.items || [];
  const displayed = allItems.slice(0, displayLimit);
  const hasMore = displayLimit < allItems.length;

  return (
    <Layout>
      <div className="max-w-screen-2xl mx-auto px-3 md:px-10 lg:px-16 xl:px-20 py-6 md:py-8">
        <div className="flex items-center justify-between gap-3 mb-5 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-black font-netflix tracking-tight text-white">
            Series
            {data && <span className="text-white/30 text-base font-normal ml-2">({data.total})</span>}
          </h1>
          <input
            type="search"
            placeholder="Buscar..."
            value={search}
            onChange={e => { setSearch(e.target.value); setDisplayLimit(PAGE_SIZE); }}
            className="bg-white/8 text-white placeholder-white/30 rounded-xl px-3 py-2 text-sm border border-white/10 focus:outline-none focus:border-[#A855F7]/60 w-36 md:w-56 transition-colors"
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 md:gap-4">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <div className="aspect-[2/3] rounded-lg bg-zinc-800 animate-pulse" />
                <div className="h-3 w-3/4 rounded bg-zinc-800 animate-pulse" />
                <div className="h-2 w-1/2 rounded bg-zinc-800 animate-pulse" />
              </div>
            ))}
          </div>
        ) : displayed.length > 0 ? (
          <>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 md:gap-4">
              {displayed.map(serie => (
                <PosterCard key={serie.id} item={serie} type="serie" variant="grid" />
              ))}
            </div>

            {hasMore && (
              <div className="flex flex-col items-center mt-8 gap-2">
                <p className="text-white/30 text-xs">{displayed.length} de {allItems.length}</p>
                <button
                  onClick={() => setDisplayLimit(prev => prev + PAGE_SIZE)}
                  className="px-6 py-2.5 bg-[#A855F7] hover:bg-[#9333EA] text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-[#A855F7]/20"
                >
                  Cargar más
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 text-white/30">
            <p className="text-sm">No se encontraron series.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
