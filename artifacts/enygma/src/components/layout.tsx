import { Link, useLocation } from "wouter";
import { Search, User, Download, SmartphoneNfc, Heart, Star, Home, Film, Tv, Swords } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useProfile } from "@/lib/profile-context";
import { useFavorites } from "@/lib/use-favorites";
import { Button } from "@/components/ui/button";
import { useInstallPrompt } from "@/lib/use-install-prompt";

export function Layout({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  const [location, setLocation] = useLocation();
  const { profile } = useProfile();
  const { favorites } = useFavorites();
  const clickCount = useRef(0);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { canInstall, install } = useInstallPrompt();
  const [installDismissed, setInstallDismissed] = useState(() => {
    try { return localStorage.getItem("pwa_install_dismissed") === "1"; } catch { return false; }
  });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    clickCount.current += 1;
    if (clickTimer.current) clearTimeout(clickTimer.current);
    if (clickCount.current >= 10) {
      clickCount.current = 0;
      setLocation("/admin");
      return;
    }
    clickTimer.current = setTimeout(() => {
      if (clickCount.current > 0 && clickCount.current < 10) setLocation("/home");
      clickCount.current = 0;
    }, 1500);
  };

  const dismissInstall = () => {
    setInstallDismissed(true);
    try { localStorage.setItem("pwa_install_dismissed", "1"); } catch {}
  };

  const navLinks = [
    { href: "/home", label: "Inicio" },
    { href: "/movies", label: "Películas" },
    { href: "/series", label: "Series" },
    { href: "/anime", label: "Anime" },
    { href: "/mylist", label: "Mi Lista" },
  ];

  const bottomNavLinks = [
    { href: "/home", label: "Inicio", icon: Home },
    { href: "/movies", label: "Películas", icon: Film },
    { href: "/series", label: "Series", icon: Tv },
    { href: "/anime", label: "Anime", icon: Swords },
    { href: "/mylist", label: "Mi Lista", icon: Heart },
    { href: "/profile", label: "Perfil", icon: User },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Header */}
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-black/95 backdrop-blur-xl border-b border-white/5"
            : "bg-gradient-to-b from-black/80 to-transparent"
        }`}
      >
        <div className="max-w-screen-2xl mx-auto px-4 md:px-10 lg:px-16 xl:px-20 h-14 md:h-16 flex items-center justify-between">
          {/* Logo + Desktop Nav */}
          <div className="flex items-center gap-4 md:gap-8">
            <span
              onClick={handleLogoClick}
              className="flex items-center gap-2 cursor-pointer select-none"
            >
              <img src="/logo.png" alt="ENYGMA" className="h-10 w-10 rounded-xl object-cover shadow-lg" />
              <span className="text-xl md:text-2xl font-bold font-display text-primary tracking-widest uppercase">ENYGMA</span>
            </span>

            {/* Desktop nav */}
            <nav className="hidden md:flex gap-6 items-center">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 text-sm font-medium transition-all duration-200 hover:text-white relative group ${
                    location === link.href ? "text-white" : "text-white/60"
                  }`}
                >
                  {link.label === "Mi Lista" && (
                    <Heart className={`w-3.5 h-3.5 ${location === link.href ? "fill-[#A855F7] text-[#A855F7]" : favorites.length > 0 ? "text-[#A855F7]" : ""}`} />
                  )}
                  {link.label}
                  {link.label === "Mi Lista" && favorites.length > 0 && (
                    <span className="bg-[#A855F7] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                      {favorites.length > 99 ? "99" : favorites.length}
                    </span>
                  )}
                  {/* Active underline */}
                  <span className={`absolute -bottom-1 left-0 right-0 h-0.5 bg-[#A855F7] rounded-full transition-all duration-200 ${location === link.href ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0 group-hover:opacity-50 group-hover:scale-x-100"}`} />
                </Link>
              ))}
            </nav>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 md:gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-white/60 hover:text-white hover:bg-white/10 transition-all"
              onClick={() => setLocation("/search")}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Desktop profile */}
            <div
              className="hidden md:flex items-center gap-2 cursor-pointer group"
              onClick={() => setLocation("/profile")}
            >
              {profile === "kids" && (
                <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider">Kids</span>
              )}
              <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/20 group-hover:border-[#A855F7] transition-all duration-200 flex-shrink-0">
                {profile ? (
                  <img
                    src={`/avatar-${profile}.png`}
                    alt={profile}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-white/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-white/60" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 w-full pt-14 md:pt-16 pb-20 md:pb-12">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 safe-area-inset-bottom">
        {/* Glassmorphism background */}
        <div className="absolute inset-0 bg-black/85 backdrop-blur-xl border-t border-white/10" />
        <div className="relative flex items-center justify-around px-2 py-2 pb-[env(safe-area-inset-bottom,8px)]">
          {bottomNavLinks.map(({ href, label, icon: Icon }) => {
            const isActive = location === href || (href === "/profiles" && location === "/");
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 active:scale-90"
              >
                <span
                  className={`flex items-center justify-center w-6 h-6 transition-all duration-200 ${
                    isActive
                      ? "text-[#A855F7]"
                      : "text-white/40"
                  }`}
                  style={
                    isActive
                      ? {
                          filter: "drop-shadow(0 0 6px #A855F7) drop-shadow(0 0 12px #A855F7aa)",
                        }
                      : undefined
                  }
                >
                  <Icon
                    className="w-5 h-5"
                    fill={isActive && label === "Mi Lista" ? "#A855F7" : "none"}
                  />
                </span>
                <span
                  className={`text-[10px] font-medium transition-all duration-200 ${
                    isActive ? "text-[#A855F7]" : "text-white/30"
                  }`}
                  style={
                    isActive
                      ? { textShadow: "0 0 8px #A855F7, 0 0 16px #A855F7aa" }
                      : undefined
                  }
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* PWA Install Banner — appears above bottom nav on mobile */}
      {canInstall && !installDismissed && (
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40 p-4 bg-black/95 border-t border-white/10 backdrop-blur-md">
          <div className="max-w-xl mx-auto flex items-center gap-3">
            <img src="/logo.png" alt="ENYGMA" className="w-10 h-10 rounded-xl flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-bold leading-tight">Instalar ENYGMA Cine</p>
              <p className="text-white/50 text-xs">Accede sin navegador desde tu pantalla</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={dismissInstall}
                className="text-white/30 hover:text-white text-sm px-2 py-1 transition-colors"
              >
                No
              </button>
              <button
                onClick={install}
                className="flex items-center gap-1.5 bg-[#A855F7] hover:bg-[#9333EA] text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Instalar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer — desktop only */}
      <footer className="hidden md:block py-6 border-t border-white/5 bg-black text-center text-white/30 text-sm">
        <div className="flex items-center justify-center gap-3 mb-3">
          <img src="/logo.png" alt="ENYGMA" className="w-8 h-8 rounded-lg opacity-50" />
          <p className="font-display tracking-wider">ENYGMA STREAMING</p>
        </div>
        <p className="mb-3">© {new Date().getFullYear()} Private Cinema Vault.</p>
        {canInstall && (
          <button
            onClick={install}
            className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-xs font-medium px-4 py-2 rounded-full transition-all"
          >
            <SmartphoneNfc className="w-3.5 h-3.5" />
            Instalar App
          </button>
        )}
      </footer>
    </div>
  );
}
