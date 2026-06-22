// Local API client configuration (replaces @workspace/api-client-react)
import { useQuery } from "@tanstack/react-query";

let _baseUrl: string | null = null;

export function setBaseUrl(url: string | null): void {
  _baseUrl = url ? url.replace(/\/+$/, "") : null;
}

export function getBaseUrl(): string | null {
  return _baseUrl;
}

// Tipos base
export interface Movie {
  id: string;
  title: string;
  description?: string;
  year?: number;
  duration?: number;
  posterPath?: string;
  rating?: number;
  [key: string]: any;
}

export interface Series {
  id: string;
  title: string;
  description?: string;
  year?: number;
  posterPath?: string;
  rating?: number;
  [key: string]: any;
}

export interface Anime extends Series {}

// Datos de ejemplo
const MOCK_MOVIES: Movie[] = [
  {
    id: "1",
    title: "The Shawshank Redemption",
    description: "Película clásica sobre esperanza",
    year: 1994,
    rating: 9.3,
    posterPath: "https://via.placeholder.com/300x450?text=Shawshank"
  },
  {
    id: "2",
    title: "The Godfather",
    description: "La película más icónica",
    year: 1972,
    rating: 9.2,
    posterPath: "https://via.placeholder.com/300x450?text=Godfather"
  },
];

const MOCK_SERIES: Series[] = [
  {
    id: "1",
    title: "Breaking Bad",
    description: "Serie de drama criminal",
    year: 2008,
    rating: 9.5,
    posterPath: "https://via.placeholder.com/300x450?text=Breaking+Bad"
  },
];

// Mock hooks - devuelven datos de ejemplo
export function useListMovies() {
  return useQuery({
    queryKey: ["movies"],
    queryFn: async () => MOCK_MOVIES,
    staleTime: Infinity,
  });
}

export function useListSeries() {
  return useQuery({
    queryKey: ["series"],
    queryFn: async () => MOCK_SERIES,
    staleTime: Infinity,
  });
}

export function useListAnime() {
  return useQuery({
    queryKey: ["anime"],
    queryFn: async () => MOCK_SERIES,
    staleTime: Infinity,
  });
}

export function useGetMovie() {
  return useQuery({
    queryKey: ["movie"],
    queryFn: async () => MOCK_MOVIES[0],
    staleTime: Infinity,
  });
}

export function useGetSeriesDetail() {
  return useQuery({
    queryKey: ["seriesDetail"],
    queryFn: async () => MOCK_SERIES[0],
    staleTime: Infinity,
  });
}

export function useGetAnimeDetail() {
  return useQuery({
    queryKey: ["animeDetail"],
    queryFn: async () => MOCK_SERIES[0],
    staleTime: Infinity,
  });
}

export function useGetTmdbDetails() {
  return useQuery({
    queryKey: ["tmdbDetails"],
    queryFn: async () => ({}),
    staleTime: Infinity,
  });
}

export function useGetTmdbPerson() {
  return useQuery({
    queryKey: ["tmdbPerson"],
    queryFn: async () => ({}),
    staleTime: Infinity,
  });
}

export function useSearchContent() {
  return useQuery({
    queryKey: ["search"],
    queryFn: async () => [...MOCK_MOVIES, ...MOCK_SERIES],
    staleTime: Infinity,
  });
}

export function useGetHomeContent() {
  return useQuery({
    queryKey: ["homeContent"],
    queryFn: async () => ({
      featured: MOCK_MOVIES,
      newReleases: MOCK_SERIES,
    }),
    staleTime: Infinity,
  });
}

export function useResolveVideo() {
  return useQuery({
    queryKey: ["resolveVideo"],
    queryFn: async () => ({}),
    staleTime: Infinity,
  });
}

// Query keys para invalidation
export const getGetMovieQueryKey = () => ["movie"];
export const getGetSeriesDetailQueryKey = () => ["seriesDetail"];
export const getGetAnimeDetailQueryKey = () => ["animeDetail"];
export const getGetTmdbDetailsQueryKey = () => ["tmdbDetails"];
export const getGetTmdbPersonQueryKey = () => ["tmdbPerson"];
export const getSearchContentQueryKey = () => ["search"];
export const getResolveVideoQueryKey = () => ["resolveVideo"];

