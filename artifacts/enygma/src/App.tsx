import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProfileProvider } from "@/lib/profile-context";

import NotFound from "@/pages/not-found";
import Profiles from "@/pages/profiles";
import ProfileUser from "@/pages/profile-user";
import Home from "@/pages/home";
import Movies from "@/pages/movies";
import Series from "@/pages/series";
import Anime from "@/pages/anime";
import Search from "@/pages/search";
import Watch from "@/pages/watch";
import MovieDetail from "@/pages/detail-movie";
import SeriesDetail from "@/pages/detail-series";
import Admin from "@/pages/admin";
import MyList from "@/pages/mylist";
import Premium from "@/pages/premium";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Profiles} />
      <Route path="/profiles" component={Profiles} />
      <Route path="/profile" component={ProfileUser} />
      <Route path="/home" component={Home} />
      <Route path="/movies" component={Movies} />
      <Route path="/series" component={Series} />
      <Route path="/anime" component={Anime} />
      <Route path="/search" component={Search} />
      <Route path="/detail/movie/:id" component={MovieDetail} />
      <Route path="/detail/:type/:id" component={SeriesDetail} />
      <Route path="/watch/:category/:id" component={Watch} />
      <Route path="/admin" component={Admin} />
      <Route path="/mylist" component={MyList} />
      <Route path="/premium" component={Premium} />
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
