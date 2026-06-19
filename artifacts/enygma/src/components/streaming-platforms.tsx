interface Platform {
  name: string;
  letter: string;
  bg: string;
  letterColor: string;
}

const ALL_PLATFORMS: Platform[] = [
  { name: "Netflix",     letter: "N",  bg: "#E50914", letterColor: "#fff" },
  { name: "Disney+",     letter: "D+", bg: "#113CCF", letterColor: "#fff" },
  { name: "Prime Video", letter: "P",  bg: "#00A8E0", letterColor: "#fff" },
  { name: "Apple TV+",   letter: "A",  bg: "#1D1D1F", letterColor: "#fff" },
  { name: "Max",         letter: "M",  bg: "#002BE7", letterColor: "#fff" },
  { name: "HBO Max",     letter: "H",  bg: "#5300E8", letterColor: "#fff" },
  { name: "Crunchyroll", letter: "CR", bg: "#F47521", letterColor: "#fff" },
  { name: "Paramount+",  letter: "P+", bg: "#0064FF", letterColor: "#fff" },
  { name: "Hulu",        letter: "Hu", bg: "#1CE783", letterColor: "#000" },
  { name: "Star+",       letter: "S+", bg: "#C01EFF", letterColor: "#fff" },
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

export function StreamingPlatforms({ contentId, count = 2 }: StreamingPlatformsProps) {
  const rand = seededRandom(contentId);
  const shuffled = [...ALL_PLATFORMS].sort(() => rand() - 0.5);
  const platforms = shuffled.slice(0, count);

  return (
    <div>
      <p className="text-xs font-bold text-white/40 uppercase tracking-[0.15em] mb-3">Disponible en</p>
      <div className="flex flex-col gap-2">
        {platforms.map((p) => (
          <div
            key={p.name}
            className="flex items-center gap-3 bg-white/5 border border-white/8 rounded-xl px-4 py-3"
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-black"
              style={{ background: p.bg, color: p.letterColor }}
            >
              {p.letter}
            </div>
            <span className="text-white font-semibold text-sm">{p.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
