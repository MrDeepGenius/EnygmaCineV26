import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProfileProvider } from "@/lib/profile-context";
import { Suspense, lazy } from "react";

import NotFound from "@/pages/not-found";
import Profiles from "@/pages/profiles";
import ProfileUser from "@/pages/profile-user";
import Home from "@/pages/home";
import Search from "@/pages/search";
import Watch from "@/pages/watch";

// Lazy load less critical pages
const Movies = lazy(() => import("@/pages/movies"));
const Series = lazy(() => import("@/pages/series"));
const Anime = lazy(() => import("@/pages/anime"));
const MovieDetail = lazy(() => import("@/pages/detail-movie"));
const SeriesDetail = lazy(() => import("@/pages/detail-series"));
const Admin = lazy(() => import("@/pages/admin"));
const MyList = lazy(() => import("@/pages/mylist"));
const Premium = lazy(() => import("@/pages/premium"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    },
  },
});

function LoadingFallback() {
  return (
    <div className="w-full h-screen bg-black flex items-center justify-center">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-white/10" />
        <div className="absolute inset-0 rounded-full border-4 border-[#A855F7] border-t-transparent animate-spin" />
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Profiles} />
      <Route path="/profiles" component={Profiles} />
      <Route path="/profile" component={ProfileUser} />
      <Route path="/home" component={Home} />
      <Route path="/search" component={Search} />
      <Route path="/watch/:category/:id" component={Watch} />
      
      <Route path="/movies">
        {() => (
          <Suspense fallback={<LoadingFallback />}>
            <Movies />
          </Suspense>
        )}
      </Route>
      <Route path="/series">
        {() => (
          <Suspense fallback={<LoadingFallback />}>
            <Series />
          </Suspense>
        )}
      </Route>
      <Route path="/anime">
        {() => (
          <Suspense fallback={<LoadingFallback />}>
            <Anime />
          </Suspense>
        )}
      </Route>
      <Route path="/detail/movie/:id">
        {() => (
          <Suspense fallback={<LoadingFallback />}>
            <MovieDetail />
          </Suspense>
        )}
      </Route>
      <Route path="/detail/:type/:id">
        {() => (
          <Suspense fallback={<LoadingFallback />}>
            <SeriesDetail />
          </Suspense>
        )}
      </Route>
      <Route path="/admin">
        {() => (
          <Suspense fallback={<LoadingFallback />}>
            <Admin />
          </Suspense>
        )}
      </Route>
      <Route path="/mylist">
        {() => (
          <Suspense fallback={<LoadingFallback />}>
            <MyList />
          </Suspense>
        )}
      </Route>
      <Route path="/premium">
        {() => (
          <Suspense fallback={<LoadingFallback />}>
            <Premium />
          </Suspense>
        )}
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ProfileProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </ProfileProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
