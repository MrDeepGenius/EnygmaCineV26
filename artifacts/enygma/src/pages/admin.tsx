import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Plus, Trash2, MoveUp, MoveDown, Download, Eye, EyeOff, Save, Check, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface BannerItem {
  id: string;
  titulo: string;
  tipo: "movie" | "serie" | "anime";
  posterUrl: string | null;
  backdropUrl: string | null;
  year?: string;
  tmdbId?: number;
}

interface CustomSection {
  id: string;
  title: string;
  position: number;
  items: BannerItem[];
}

interface AdminConfig {
  banner: { override: boolean; items: BannerItem[] };
  top10: { override: boolean; items: BannerItem[] };
  hiddenSections: string[];
  customSections: CustomSection[];
}

const DEFAULT_SECTIONS = [
  { key: "top10", label: "Top 10 en ENYGMA" },
  { key: "trending", label: "Tendencias" },
  { key: "recommended", label: "Recomendados para ti" },
  { key: "latestMovies", label: "Últimas Películas Añadidas" },
  { key: "latestSeries", label: "Últimas Series" },
  { key: "latestAnime", label: "Últimos Anime" },
];

const TMDB_TYPES = [
  { key: "trending", label: "Tendencias (Semana)" },
  { key: "popular_movies", label: "Películas Populares" },
  { key: "popular_series", label: "Series Populares" },
  { key: "upcoming", label: "Próximos Estrenos" },
  { key: "top_rated", label: "Mejor Valoradas (Películas)" },
  { key: "top_rated_series", label: "Mejor Valoradas (Series)" },
];

type Tab = "secciones" | "banner" | "top10" | "tmdb";

function SaveBadge({ saved }: { saved: boolean }) {
  return (
    <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full transition-all ${saved ? "bg-green-900/50 text-green-400" : "bg-white/5 text-white/30"}`}>
      {saved ? <><Check className="w-3 h-3" />Guardado</> : <><Save className="w-3 h-3" />Sin guardar</>}
    </span>
  );
}

export default function Admin() {
  const [, setLocation] = useLocation();
  const [config, setConfig] = useState<AdminConfig | null>(null);
  const [tab, setTab] = useState<Tab>("secciones");
  const [saved, setSaved] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tmdbLoading, setTmdbLoading] = useState(false);
  const [tmdbItems, setTmdbItems] = useState<BannerItem[]>([]);
  const [tmdbType, setTmdbType] = useState("trending");
  const [tmdbSectionTitle, setTmdbSectionTitle] = useState("");
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [bannerSearch, setBannerSearch] = useState("");
  const [newBannerItem, setNewBannerItem] = useState<Partial<BannerItem>>({ tipo: "movie" });

  useEffect(() => {
    fetch(`${BASE}/api/admin/config`)
      .then((r) => r.json())
      .then((d) => { setConfig(d); setSaved(true); })
      .catch(() => {
        setConfig({ banner: { override: false, items: [] }, top10: { override: false, items: [] }, hiddenSections: [], customSections: [] });
      });
  }, []);

  const updateConfig = useCallback((updater: (c: AdminConfig) => AdminConfig) => {
    setConfig((prev) => { if (!prev) return prev; return updater(prev); });
    setSaved(false);
  }, []);

  const saveConfig = async () => {
    if (!config) return;
    setSaving(true);
    try {
      await fetch(`${BASE}/api/admin/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const toggleHiddenSection = (key: string) => {
    updateConfig((c) => ({
      ...c,
      hiddenSections: c.hiddenSections.includes(key)
        ? c.hiddenSections.filter((k) => k !== key)
        : [...c.hiddenSections, key],
    }));
  };

  const addCustomSection = () => {
    if (!newSectionTitle.trim()) return;
    const id = `custom_${Date.now()}`;
    updateConfig((c) => ({
      ...c,
      customSections: [...c.customSections, { id, title: newSectionTitle.trim(), position: c.customSections.length, items: [] }],
    }));
    setNewSectionTitle("");
  };

  const removeCustomSection = (id: string) => {
    updateConfig((c) => ({ ...c, customSections: c.customSections.filter((s) => s.id !== id) }));
  };

  const moveSection = (id: string, dir: -1 | 1) => {
    updateConfig((c) => {
      const arr = [...c.customSections];
      const idx = arr.findIndex((s) => s.id === id);
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= arr.length) return c;
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return { ...c, customSections: arr.map((s, i) => ({ ...s, position: i })) };
    });
  };

  const removeSectionItem = (sectionId: string, itemId: string) => {
    updateConfig((c) => ({
      ...c,
      customSections: c.customSections.map((s) =>
        s.id === sectionId ? { ...s, items: s.items.filter((i) => i.id !== itemId) } : s
      ),
    }));
  };

  const fetchTmdb = async () => {
    setTmdbLoading(true);
    setTmdbItems([]);
    try {
      const res = await fetch(`${BASE}/api/admin/tmdb-fetch?type=${tmdbType}`);
      const data = await res.json();
      setTmdbItems(data.items || []);
      setTmdbSectionTitle(TMDB_TYPES.find((t) => t.key === tmdbType)?.label || "Sección TMDB");
    } finally {
      setTmdbLoading(false);
    }
  };

  const saveTmdbAsSection = () => {
    if (!tmdbItems.length || !tmdbSectionTitle.trim()) return;
    const id = `tmdb_${Date.now()}`;
    updateConfig((c) => ({
      ...c,
      customSections: [
        ...c.customSections,
        { id, title: tmdbSectionTitle.trim(), position: c.customSections.length, items: tmdbItems },
      ],
    }));
    setTmdbItems([]);
    setTab("secciones");
  };

  const addBannerItem = () => {
    if (!newBannerItem.id || !newBannerItem.titulo) return;
    const item: BannerItem = {
      id: newBannerItem.id,
      titulo: newBannerItem.titulo,
      tipo: (newBannerItem.tipo as BannerItem["tipo"]) || "movie",
      posterUrl: newBannerItem.posterUrl || null,
      backdropUrl: newBannerItem.backdropUrl || null,
    };
    updateConfig((c) => ({ ...c, banner: { ...c.banner, items: [...c.banner.items, item] } }));
    setNewBannerItem({ tipo: "movie" });
    setBannerSearch("");
  };

  const removeBannerItem = (id: string) => {
    updateConfig((c) => ({ ...c, banner: { ...c.banner, items: c.banner.items.filter((i) => i.id !== id) } }));
  };

  const addTop10Item = () => {
    if (!newBannerItem.id || !newBannerItem.titulo) return;
    const item: BannerItem = {
      id: newBannerItem.id,
      titulo: newBannerItem.titulo,
      tipo: (newBannerItem.tipo as BannerItem["tipo"]) || "movie",
      posterUrl: newBannerItem.posterUrl || null,
      backdropUrl: newBannerItem.backdropUrl || null,
    };
    updateConfig((c) => ({ ...c, top10: { ...c.top10, items: [...c.top10.items, item] } }));
    setNewBannerItem({ tipo: "movie" });
  };

  const removeTop10Item = (id: string) => {
    updateConfig((c) => ({ ...c, top10: { ...c.top10, items: c.top10.items.filter((i) => i.id !== id) } }));
  };

  if (!config) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#A855F7] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/95 border-b border-white/10 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setLocation("/home")} className="text-white/50 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-[#A855F7] font-bold font-display tracking-widest uppercase text-lg">ENYGMA</span>
            <span className="text-white/30 text-sm">/ Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <SaveBadge saved={saved} />
            <button
              onClick={saveConfig}
              disabled={saving || saved}
              className="flex items-center gap-2 bg-[#A855F7] hover:bg-[#9333EA] disabled:opacity-40 text-white text-sm font-bold px-4 py-2 rounded transition-all"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto px-4 mt-6">
        <div className="flex gap-1 bg-white/5 p-1 rounded-lg mb-8 overflow-x-auto">
          {([
            { key: "secciones", label: "Secciones" },
            { key: "banner", label: "Banner" },
            { key: "top10", label: "Top 10" },
            { key: "tmdb", label: "Importar de TMDB" },
          ] as { key: Tab; label: string }[]).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-md text-sm font-semibold transition-all ${tab === t.key ? "bg-[#A855F7] text-white" : "text-white/50 hover:text-white"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* SECCIONES TAB */}
        {tab === "secciones" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold mb-1">Secciones de Inicio</h2>
              <p className="text-white/40 text-sm mb-4">Activa o desactiva las secciones predeterminadas del home.</p>
              <div className="space-y-2">
                {DEFAULT_SECTIONS.map((s) => {
                  const hidden = config.hiddenSections.includes(s.key);
                  return (
                    <div key={s.key} className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-3 hover:bg-white/8 transition-colors">
                      <span className={`text-sm font-medium ${hidden ? "text-white/30 line-through" : "text-white"}`}>{s.label}</span>
                      <button onClick={() => toggleHiddenSection(s.key)} className={`p-1.5 rounded transition-colors ${hidden ? "text-white/30 hover:text-white" : "text-[#A855F7] hover:text-red-400"}`}>
                        {hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="h-px bg-white/10" />

            <div>
              <h2 className="text-lg font-bold mb-1">Secciones Personalizadas</h2>
              <p className="text-white/40 text-sm mb-4">Crea secciones propias con contenido de TMDB o manual.</p>

              {/* Add new section */}
              <div className="flex gap-2 mb-4">
                <input
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCustomSection()}
                  placeholder="Nombre de la nueva sección..."
                  className="flex-1 bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#A855F7]"
                />
                <button onClick={addCustomSection} className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                  <Plus className="w-4 h-4" />
                  Agregar
                </button>
              </div>

              {/* Existing custom sections */}
              {config.customSections.length === 0 && (
                <div className="text-center py-10 text-white/20 text-sm border border-dashed border-white/10 rounded-lg">
                  No hay secciones personalizadas. Crea una arriba o importa desde TMDB.
                </div>
              )}
              <div className="space-y-3">
                {config.customSections.map((section, idx) => (
                  <div key={section.id} className="bg-white/5 rounded-xl border border-white/8">
                    <div className="flex items-center gap-3 px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <button onClick={() => moveSection(section.id, -1)} disabled={idx === 0} className="text-white/30 hover:text-white disabled:opacity-10 transition-colors p-0.5">
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button onClick={() => moveSection(section.id, 1)} disabled={idx === config.customSections.length - 1} className="text-white/30 hover:text-white disabled:opacity-10 transition-colors p-0.5">
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{section.title}</p>
                        <p className="text-white/30 text-xs">{section.items.length} items</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)} className="text-white/50 hover:text-white transition-colors p-1.5">
                          {expandedSection === section.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        <button onClick={() => removeCustomSection(section.id)} className="text-white/30 hover:text-[#A855F7] transition-colors p-1.5">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {expandedSection === section.id && (
                      <div className="border-t border-white/8 px-4 py-3">
                        {section.items.length === 0 ? (
                          <p className="text-white/30 text-sm text-center py-4">Sin items. Importa desde TMDB o agrega manualmente.</p>
                        ) : (
                          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {section.items.map((item) => (
                              <div key={item.id} className="flex-shrink-0 w-20 relative group">
                                {item.posterUrl ? (
                                  <img src={item.posterUrl} alt={item.titulo} className="w-20 h-28 object-cover rounded-lg" />
                                ) : (
                                  <div className="w-20 h-28 bg-white/10 rounded-lg flex items-center justify-center text-xs text-white/30 text-center px-1">{item.titulo}</div>
                                )}
                                <button
                                  onClick={() => removeSectionItem(section.id, item.id)}
                                  className="absolute top-1 right-1 w-6 h-6 bg-black/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[#A855F7]"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                                <p className="text-xs text-white/60 mt-1 truncate">{item.titulo}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* BANNER TAB */}
        {tab === "banner" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold mb-1">Banner Principal</h2>
                <p className="text-white/40 text-sm">Personaliza qué contenido aparece en el banner de inicio.</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-white/40 text-sm">{config.banner.override ? "Override activo" : "Automático"}</span>
                <button
                  onClick={() => updateConfig((c) => ({ ...c, banner: { ...c.banner, override: !c.banner.override } }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${config.banner.override ? "bg-[#A855F7]" : "bg-white/20"}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${config.banner.override ? "translate-x-6" : "translate-x-0.5"}`} />
                </button>
              </div>
            </div>

            {config.banner.override && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 items-end">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs text-white/40 mb-1 block">ID (Google Sheets)</label>
                    <input
                      value={bannerSearch}
                      onChange={(e) => { setBannerSearch(e.target.value); setNewBannerItem((p) => ({ ...p, id: e.target.value })); }}
                      placeholder="ID del contenido..."
                      className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#A855F7]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 mb-1 block">Título</label>
                    <input
                      value={newBannerItem.titulo || ""}
                      onChange={(e) => setNewBannerItem((p) => ({ ...p, titulo: e.target.value }))}
                      placeholder="Título..."
                      className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#A855F7]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 mb-1 block">Tipo</label>
                    <select
                      value={newBannerItem.tipo || "movie"}
                      onChange={(e) => setNewBannerItem((p) => ({ ...p, tipo: e.target.value as BannerItem["tipo"] }))}
                      className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#A855F7]"
                    >
                      <option value="movie">Película</option>
                      <option value="serie">Serie</option>
                      <option value="anime">Anime</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-white/40 mb-1 block">Poster URL</label>
                    <input
                      value={newBannerItem.posterUrl || ""}
                      onChange={(e) => setNewBannerItem((p) => ({ ...p, posterUrl: e.target.value }))}
                      placeholder="https://..."
                      className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#A855F7]"
                    />
                  </div>
                  <div className="sm:col-start-2">
                    <button onClick={addBannerItem} className="w-full flex items-center justify-center gap-2 bg-[#A855F7] hover:bg-[#9333EA] text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors mt-5">
                      <Plus className="w-4 h-4" />
                      Agregar al Banner
                    </button>
                  </div>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {config.banner.items.length === 0 && (
                    <div className="w-full text-center py-10 text-white/20 text-sm border border-dashed border-white/10 rounded-lg">
                      Sin items en el banner. Agrega contenido arriba.
                    </div>
                  )}
                  {config.banner.items.map((item) => (
                    <div key={item.id} className="flex-shrink-0 w-28 relative group">
                      {item.posterUrl ? (
                        <img src={item.posterUrl} alt={item.titulo} className="w-28 h-40 object-cover rounded-xl" />
                      ) : (
                        <div className="w-28 h-40 bg-white/10 rounded-xl flex items-center justify-center text-xs text-white/30 text-center px-2">{item.titulo}</div>
                      )}
                      <button
                        onClick={() => removeBannerItem(item.id)}
                        className="absolute top-2 right-2 w-7 h-7 bg-black/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[#A855F7]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <p className="text-xs text-white/60 mt-1.5 truncate">{item.titulo}</p>
                      <p className="text-xs text-[#A855F7]/60">{item.tipo}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
            {!config.banner.override && (
              <div className="text-center py-12 text-white/20 text-sm border border-dashed border-white/10 rounded-xl">
                El banner se genera automáticamente desde el catálogo.<br />Activa el override para personalizarlo.
              </div>
            )}
          </div>
        )}

        {/* TOP 10 TAB */}
        {tab === "top10" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold mb-1">Top 10 en ENYGMA</h2>
                <p className="text-white/40 text-sm">Controla manualmente qué aparece en el Top 10.</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-white/40 text-sm">{config.top10.override ? "Override activo" : "Automático"}</span>
                <button
                  onClick={() => updateConfig((c) => ({ ...c, top10: { ...c.top10, override: !c.top10.override } }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${config.top10.override ? "bg-[#A855F7]" : "bg-white/20"}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${config.top10.override ? "translate-x-6" : "translate-x-0.5"}`} />
                </button>
              </div>
            </div>

            {config.top10.override && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 items-end">
                  <div>
                    <label className="text-xs text-white/40 mb-1 block">ID</label>
                    <input
                      value={newBannerItem.id || ""}
                      onChange={(e) => setNewBannerItem((p) => ({ ...p, id: e.target.value }))}
                      placeholder="ID del contenido..."
                      className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#A855F7]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 mb-1 block">Título</label>
                    <input
                      value={newBannerItem.titulo || ""}
                      onChange={(e) => setNewBannerItem((p) => ({ ...p, titulo: e.target.value }))}
                      placeholder="Título..."
                      className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#A855F7]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 mb-1 block">Tipo</label>
                    <select
                      value={newBannerItem.tipo || "movie"}
                      onChange={(e) => setNewBannerItem((p) => ({ ...p, tipo: e.target.value as BannerItem["tipo"] }))}
                      className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#A855F7]"
                    >
                      <option value="movie">Película</option>
                      <option value="serie">Serie</option>
                      <option value="anime">Anime</option>
                    </select>
                  </div>
                  <div className="sm:col-start-3">
                    <button onClick={addTop10Item} className="w-full flex items-center justify-center gap-2 bg-[#A855F7] hover:bg-[#9333EA] text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors mt-5">
                      <Plus className="w-4 h-4" />
                      Agregar
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {config.top10.items.length === 0 && (
                    <div className="text-center py-10 text-white/20 text-sm border border-dashed border-white/10 rounded-lg">
                      Sin items. Agrega contenido arriba.
                    </div>
                  )}
                  {config.top10.items.map((item, i) => (
                    <div key={item.id} className="flex items-center gap-4 bg-white/5 rounded-lg px-4 py-3">
                      <span className="text-4xl font-bold font-display text-white/20 w-10 text-right leading-none">{i + 1}</span>
                      {item.posterUrl && <img src={item.posterUrl} alt={item.titulo} className="w-10 h-14 object-cover rounded" />}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{item.titulo}</p>
                        <p className="text-white/30 text-xs capitalize">{item.tipo}</p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            updateConfig((c) => {
                              const arr = [...c.top10.items];
                              if (i > 0) [arr[i], arr[i - 1]] = [arr[i - 1], arr[i]];
                              return { ...c, top10: { ...c.top10, items: arr } };
                            });
                          }}
                          disabled={i === 0}
                          className="text-white/30 hover:text-white disabled:opacity-10 p-1 transition-colors"
                        >
                          <MoveUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            updateConfig((c) => {
                              const arr = [...c.top10.items];
                              if (i < arr.length - 1) [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
                              return { ...c, top10: { ...c.top10, items: arr } };
                            });
                          }}
                          disabled={i === config.top10.items.length - 1}
                          className="text-white/30 hover:text-white disabled:opacity-10 p-1 transition-colors"
                        >
                          <MoveDown className="w-4 h-4" />
                        </button>
                        <button onClick={() => removeTop10Item(item.id)} className="text-white/30 hover:text-[#A855F7] p-1 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {!config.top10.override && (
              <div className="text-center py-12 text-white/20 text-sm border border-dashed border-white/10 rounded-xl">
                El Top 10 se genera automáticamente desde el catálogo.<br />Activa el override para controlarlo manualmente.
              </div>
            )}
          </div>
        )}

        {/* TMDB TAB */}
        {tab === "tmdb" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold mb-1">Importar desde TMDB</h2>
              <p className="text-white/40 text-sm mb-4">Trae contenido de TMDB y guárdalo como una sección del home.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-white/40 mb-1 block">Tipo de contenido</label>
                <select
                  value={tmdbType}
                  onChange={(e) => setTmdbType(e.target.value)}
                  className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#A855F7]"
                >
                  {TMDB_TYPES.map((t) => (
                    <option key={t.key} value={t.key}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={fetchTmdb}
                  disabled={tmdbLoading}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/15 disabled:opacity-40 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors w-full justify-center"
                >
                  {tmdbLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Traer de TMDB
                </button>
              </div>
            </div>

            {tmdbItems.length > 0 && (
              <>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {tmdbItems.map((item) => (
                    <div key={item.id} className="flex-shrink-0 w-24">
                      {item.posterUrl ? (
                        <img src={item.posterUrl} alt={item.titulo} className="w-24 h-36 object-cover rounded-xl" />
                      ) : (
                        <div className="w-24 h-36 bg-white/10 rounded-xl flex items-center justify-center text-xs text-white/30 text-center px-1">{item.titulo}</div>
                      )}
                      <p className="text-xs text-white/60 mt-1.5 truncate">{item.titulo}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-white/5 rounded-xl border border-white/10 p-4 space-y-3">
                  <p className="text-sm font-semibold text-white/70">Guardar como sección</p>
                  <div className="flex gap-3">
                    <input
                      value={tmdbSectionTitle}
                      onChange={(e) => setTmdbSectionTitle(e.target.value)}
                      placeholder="Nombre de la sección..."
                      className="flex-1 bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#A855F7]"
                    />
                    <button
                      onClick={saveTmdbAsSection}
                      className="flex items-center gap-2 bg-[#A855F7] hover:bg-[#9333EA] text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Guardar Sección
                    </button>
                  </div>
                  <p className="text-xs text-white/30">{tmdbItems.length} items se agregarán a la sección. Luego guarda los cambios.</p>
                </div>
              </>
            )}

            {!tmdbLoading && tmdbItems.length === 0 && (
              <div className="text-center py-12 text-white/20 text-sm border border-dashed border-white/10 rounded-xl">
                Selecciona un tipo de contenido y presiona "Traer de TMDB"
              </div>
            )}
          </div>
        )}

        <div className="h-16" />
      </div>
    </div>
  );
}
