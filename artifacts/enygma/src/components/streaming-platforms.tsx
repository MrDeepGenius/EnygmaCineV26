interface Platform {
  name: string;
  shortName: string;
  bg: string;
  text: string;
  accent: string;
  logo: string;
}

const ALL_PLATFORMS: Platform[] = [
  {
    name: "Netflix",
    shortName: "N",
    bg: "linear-gradient(135deg, #141414 0%, #1a0000 100%)",
    text: "#A855F7",
    accent: "#A855F7",
    logo: "NETFLIX",
  },
  {
    name: "Disney+",
    shortName: "D+",
    bg: "linear-gradient(135deg, #040714 0%, #0b1a6e 100%)",
    text: "#ffffff",
    accent: "#113ccf",
    logo: "DISNEY+",
  },
  {
    name: "Prime Video",
    shortName: "P",
    bg: "linear-gradient(135deg, #00111a 0%, #003d5c 100%)",
    text: "#00a8e0",
    accent: "#00a8e0",
    logo: "prime video",
  },
  {
    name: "Apple TV+",
    shortName: "A",
    bg: "linear-gradient(135deg, #1d1d1f 0%, #2c2c2e 100%)",
    text: "#ffffff",
    accent: "#ffffff",
    logo: "Apple TV+",
  },
  {
    name: "Max",
    shortName: "M",
    bg: "linear-gradient(135deg, #001433 0%, #002be7 100%)",
    text: "#ffffff",
    accent: "#5599ff",
    logo: "max",
  },
  {
    name: "Crunchyroll",
    shortName: "CR",
    bg: "linear-gradient(135deg, #1a0a00 0%, #f47521 100%)",
    text: "#ffffff",
    accent: "#f47521",
    logo: "CRUNCHYROLL",
  },
  {
    name: "HBO",
    shortName: "H",
    bg: "linear-gradient(135deg, #1a0033 0%, #8c14fc 100%)",
    text: "#ffffff",
    accent: "#bf7fff",
    logo: "HBO",
  },
  {
    name: "Paramount+",
    shortName: "P+",
    bg: "linear-gradient(135deg, #000c33 0%, #0064ff 100%)",
    text: "#ffffff",
    accent: "#4d94ff",
    logo: "PARAMOUNT+",
  },
];

function seededRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return () => {
    h ^= h >>> 16;
    h = Math.imul(h, 0x45d9f3b);
    h ^= h >>> 16;
    return (h >>> 0) / 0xffffffff;
  };
}

interface StreamingPlatformsProps {
  contentId: string;
  count?: number;
}

export function StreamingPlatforms({ contentId, count = 4 }: StreamingPlatformsProps) {
  const rand = seededRandom(contentId);
  const shuffled = [...ALL_PLATFORMS].sort(() => rand() - 0.5);
  const platforms = shuffled.slice(0, count);

  return (
    <div>
      <p className="text-xs font-bold text-white/35 uppercase tracking-[0.15em] mb-3">Disponible en</p>
      <div className="flex flex-wrap gap-2.5">
        {platforms.map((p) => (
          <div
            key={p.name}
            className="group relative flex items-center gap-2 px-3.5 py-2 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 hover:brightness-110 select-none"
            style={{
              background: p.bg,
              border: `1px solid ${p.accent}35`,
              boxShadow: `0 2px 16px ${p.accent}25, inset 0 1px 0 rgba(255,255,255,0.05)`,
            }}
          >
            {/* Coloured dot */}
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: p.accent, boxShadow: `0 0 6px ${p.accent}` }}
            />
            <span
              className="text-xs font-black tracking-wider leading-none whitespace-nowrap"
              style={{ color: p.text }}
            >
              {p.logo}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
