import { useState } from "react";
import { useSearchContent, getSearchContentQueryKey } from "@workspace/api-client-react";
import { useProfile } from "@/lib/profile-context";
import { useDebounce } from "@/hooks/use-debounce";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PosterCard } from "@/components/poster-card";
import { Layout } from "@/components/layout";

export default function Search() {
  const { profile } = useProfile();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  const { data: searchResults, isLoading } = useSearchContent(
    { q: debouncedQuery, profile: profile || undefined, limit: 50 },
    { query: { enabled: debouncedQuery.length > 1, queryKey: getSearchContentQueryKey({ q: debouncedQuery, profile: profile || undefined, limit: 50 }) } }
  );

  return (
    <Layout>
      <div className="max-w-screen-2xl mx-auto px-4 md:px-10 lg:px-16 xl:px-20 py-8">
        <div className="max-w-2xl mx-auto mb-12 relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-6 h-6" />
          <Input
            type="text"
            placeholder="Películas, series, anime..."
            className="w-full pl-14 h-16 text-lg bg-card border-border rounded-full focus-visible:ring-primary focus-visible:border-primary text-white placeholder:text-muted-foreground"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>

        {debouncedQuery.length < 2 ? (
          <div className="text-center py-20 text-muted-foreground">
            <SearchIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <h2 className="text-2xl font-display">Busca en la bóveda</h2>
            <p className="mt-2">Encuentra tus películas, series y animes favoritos.</p>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : searchResults && (searchResults.movies.length > 0 || searchResults.series.length > 0 || searchResults.anime.length > 0) ? (
          <Tabs defaultValue="movies" className="w-full">
            <TabsList className="bg-card w-full max-w-md mx-auto flex mb-8">
              <TabsTrigger value="movies" className="flex-1 data-[state=active]:bg-primary">
                Películas ({searchResults.movies.length})
              </TabsTrigger>
              <TabsTrigger value="series" className="flex-1 data-[state=active]:bg-primary">
                Series ({searchResults.series.length})
              </TabsTrigger>
              <TabsTrigger value="anime" className="flex-1 data-[state=active]:bg-primary">
                Anime ({searchResults.anime.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="movies" className="mt-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {searchResults.movies.map(movie => (
                  <PosterCard key={movie.id} item={movie as any} type="movie" />
                ))}
                {searchResults.movies.length === 0 && (
                  <div className="col-span-full py-12 text-center text-muted-foreground">No se encontraron películas.</div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="series" className="mt-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {searchResults.series.map(series => (
                  <PosterCard key={series.id} item={series as any} type="serie" />
                ))}
                {searchResults.series.length === 0 && (
                  <div className="col-span-full py-12 text-center text-muted-foreground">No se encontraron series.</div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="anime" className="mt-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {searchResults.anime.map(anime => (
                  <PosterCard key={anime.id} item={anime as any} type="anime" />
                ))}
                {searchResults.anime.length === 0 && (
                  <div className="col-span-full py-12 text-center text-muted-foreground">No se encontró anime.</div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <h2 className="text-xl font-display mb-2">Sin resultados para "{debouncedQuery}"</h2>
            <p>Intenta con otros términos de búsqueda.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
