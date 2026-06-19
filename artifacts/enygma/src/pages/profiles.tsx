import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useProfile, type ProfileId } from "@/lib/profile-context";

const PROFILES = [
  {
    id: "senor",
    name: "Sr. Enigma",
    avatar: "/avatar-senor.png",
    glow: "#A855F7",
    border: "border-[#A855F7]/50 hover:border-[#A855F7]",
    shadow: "0 0 30px #A855F740, 0 0 60px #A855F720",
    hoverShadow: "0 0 40px #A855F770, 0 0 80px #A855F740",
  },
  {
    id: "senora",
    name: "Sra. Enigma",
    avatar: "/avatar-senora.png",
    glow: "#e91e9e",
    border: "border-pink-500/50 hover:border-pink-400",
    shadow: "0 0 30px #e91e9e40, 0 0 60px #e91e9e20",
    hoverShadow: "0 0 40px #e91e9e70, 0 0 80px #e91e9e40",
  },
  {
    id: "kids",
    name: "Kids",
    avatar: "/avatar-kids.png",
    glow: "#facc15",
    border: "border-yellow-400/50 hover:border-yellow-300",
    shadow: "0 0 30px #facc1540, 0 0 60px #facc1520",
    hoverShadow: "0 0 40px #facc1570, 0 0 80px #facc1540",
  },
];

export default function Profiles() {
  const [, setLocation] = useLocation();
  const { setProfile } = useProfile();

  const handleSelectProfile = (id: string) => {
    setProfile(id as ProfileId);
    setLocation("/home");
  };

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Animated background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 60%, #1a000a 0%, #000 70%)",
        }}
      />
      {/* Subtle film grain overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")" }}
      />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center mb-8 sm:mb-12 relative z-10"
      >
        <img
          src="/logo.png"
          alt="ENYGMA"
          className="w-14 h-14 sm:w-18 sm:h-18 rounded-2xl shadow-2xl mb-3 object-cover"
          style={{ boxShadow: "0 0 40px #A855F740" }}
        />
        <h1 className="text-lg sm:text-2xl font-black font-netflix tracking-[0.2em] text-[#A855F7] uppercase">
          ENYGMA CINE
        </h1>
      </motion.div>

      {/* Who's watching */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="flex flex-col items-center relative z-10 w-full max-w-lg"
      >
        <h2 className="text-xl sm:text-3xl font-black font-netflix text-white/80 mb-8 sm:mb-12 tracking-tight">
          ¿Quién está viendo?
        </h2>

        {/* Profiles grid — 3 across on any screen */}
        <div className="grid grid-cols-3 gap-4 sm:gap-8 w-full px-2">
          {PROFILES.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.12, type: "spring", stiffness: 200, damping: 18 }}
              whileHover={{ scale: 1.07, y: -4 }}
              whileTap={{ scale: 0.94 }}
              className="flex flex-col items-center cursor-pointer group"
              onClick={() => handleSelectProfile(p.id)}
            >
              {/* Avatar */}
              <div
                className={`relative w-full aspect-square rounded-xl sm:rounded-2xl overflow-hidden border-2 transition-all duration-300 ${p.border}`}
                style={{ boxShadow: p.shadow }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = p.hoverShadow;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = p.shadow;
                }}
              >
                <img
                  src={p.avatar}
                  alt={p.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Gloss overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/30" />
              </div>

              {/* Name */}
              <span
                className="mt-2 sm:mt-3 text-xs sm:text-sm font-bold text-white/60 group-hover:text-white transition-colors text-center leading-tight font-netflix"
              >
                {p.name}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
