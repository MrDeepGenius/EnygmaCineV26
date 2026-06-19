import { useGetHomeContent } from "@workspace/api-client-react";
import { useProfile } from "@/lib/profile-context";
import { useFavorites } from "@/lib/use-favorites";
import { Layout } from "@/components/layout";
import { Banner } from "@/components/banner";
import { HorizontalRow } from "@/components/horizontal-row";
import { ContinueWatchingRow } from "@/components/continue-watching-row";
import { useEffect, useState } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface AdminItem {
  id: string;
  titulo: string;
  tipo: "movie" | "serie" | "anime";
  posterUrl: string | null;
  backdropUrl: string | null;
  year?: string;
  tmdbId?: number;
  overview?: string;
}

interface AdminConfig {
  banner: { override: boolean; items: AdminItem[] };
  top10: { override: boolean; items: AdminItem[] };
  hiddenSections: string[];
  customSections: Array<{ id: string; title: string; position: number; items: AdminItem[] }>;
}

function toRowItem(item: AdminItem) {
  return {
    id: item.id,
    titulo: item.titulo,
    categoria: item.tipo,
    posterUrl: item.posterUrl,
    backdropUrl: item.backdropUrl,
    year: item.year || "",
    sinopsis: item.overview || "",
    tmdbId: item.tmdbId,
  };
}

export default function Home() {
  const { profile } = useProfile();
  const { favorites } = useFavorites();
  const [adminConfig, setAdminConfig] = useState<AdminConfig | null>(null);

  const { data: content, isLoading } = useGetHomeContent(
    { profile: profile || undefined }
  );

  useEffect(() => {
    fetch(`${BASE}/api/admin/config`)
      .then((r) => r.json())
      .then((d: AdminConfig) => setAdminConfig(d))
      .catch(() => setAdminConfig(null));
  }, []);

  if (isLoading) {
    return (
      <Layout>
        <div className="w-full h-[70vh] bg-zinc-900 animate-pulse mb-8" />
        <div className="px-4 md:px-10 lg:px-16 xl:px-20 space-y-10">
          {[1, 2, 3].map(i => (
            <div key={i}>
              <div className="h-6 w-40 bg-zinc-800 animate-pulse rounded mb-4" />
              <div className="flex gap-3">
                {[1,2,3,4,5].map(j => (
                  <div key={j} className="flex-shrink-0 w-[260px] aspect-video bg-zinc-800 animate-pulse rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Layout>
    );
  }

  if (!content) return null;

  const hidden = adminConfig?.hiddenSections || [];

  const bannerItems = (adminConfig?.banner.override && adminConfig.banner.items.length > 0)
    ? adminConfig.banner.items.map(toRowItem)
    : (content.banner || []);

  const top10Items = (adminConfig?.top10.override && adminConfig.top10.items.length > 0)
    ? adminConfig.top10.items.map(toRowItem)
    : (content.top10 || []);

  const customSections = adminConfig?.customSections
    ? [...adminConfig.customSections].sort((a, b) => a.position - b.position)
    : [];

  return (
    <Layout>
      <Banner items={bannerItems} />

      <div className="mt-6">
        {/* Continuar Viendo — aparece automáticamente cuando hay progreso */}
        <ContinueWatchingRow />

        {favorites.length > 0 && (
          <HorizontalRow
            title="Mi Lista"
            items={favorites.map((f) => ({
              id: f.id,
              titulo: f.titulo,
              posterUrl: f.posterUrl,
              backdropUrl: f.backdropUrl,
              año: f.año,
              categoria: f.categoria,
              genero: "",
              sinopsis: "",
              esVip: false,
              videoUrl: "",
            })) as any}
            type="movie"
            variant="landscape"
          />
        )}

        {!hidden.includes("top10") && (
          <HorizontalRow
            title="Top 10 en ENYGMA"
            items={top10Items}
            type="movie"
            isNumbered={true}
            variant="landscape"
          />
        )}

        {!hidden.includes("trending") && (
          <HorizontalRow
            title="Tendencias"
            items={content.trending || []}
            type="movie"
            variant="landscape"
          />
        )}

        {!hidden.includes("recommended") && (
          <HorizontalRow
            title="Populares en ENYGMA"
            items={content.recommended || []}
            type="movie"
            variant="landscape"
          />
        )}

        {customSections.map((section) => (
          section.items.length > 0 && (
            <HorizontalRow
              key={section.id}
              title={section.title}
              items={section.items.map(toRowItem)}
              type="movie"
              variant="landscape"
            />
          )
        ))}

        {!hidden.includes("latestMovies") && (
          <HorizontalRow
            title="Ultimas Peliculas"
            items={content.latestMovies || []}
            type="movie"
            variant="landscape"
          />
        )}

        {!hidden.includes("latestSeries") && (
          <HorizontalRow
            title="Ultimas Series"
            items={content.latestSeries || []}
            type="serie"
            variant="landscape"
          />
        )}

        {!hidden.includes("latestAnime") && (
          <HorizontalRow
            title="Ultimo Anime"
            items={content.latestAnime || []}
            type="anime"
            variant="landscape"
          />
        )}
      </div>
    </Layout>
  );
}
