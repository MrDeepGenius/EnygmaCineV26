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

// Mock hooks - retornan datos vacíos pero no rompen la app
export function useListMovies() {
  return useQuery({
    queryKey: ["movies"],
    queryFn: async () => [],
    staleTime: Infinity,
  });
}

export function useListSeries() {
  return useQuery({
    queryKey: ["series"],
    queryFn: async () => [],
    staleTime: Infinity,
  });
}

export function useListAnime() {
  return useQuery({
    queryKey: ["anime"],
    queryFn: async () => [],
    staleTime: Infinity,
  });
}

export function useGetMovie() {
  return useQuery({
    queryKey: ["movie"],
    queryFn: async () => ({}),
    staleTime: Infinity,
  });
}

export function useGetSeriesDetail() {
  return useQuery({
    queryKey: ["seriesDetail"],
    queryFn: async () => ({}),
    staleTime: Infinity,
  });
}

export function useGetAnimeDetail() {
  return useQuery({
    queryKey: ["animeDetail"],
    queryFn: async () => ({}),
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
    queryFn: async () => [],
    staleTime: Infinity,
  });
}

export function useGetHomeContent() {
  return useQuery({
    queryKey: ["homeContent"],
    queryFn: async () => ({}),
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

