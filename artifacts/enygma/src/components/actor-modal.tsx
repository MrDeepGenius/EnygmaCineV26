import { useEffect } from "react";
import { X, MapPin, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useGetTmdbPerson, getGetTmdbPersonQueryKey } from "@workspace/api-client-react";

interface ActorModalProps {
  personId: number | null;
  onClose: () => void;
  appIds?: Set<string>;
}

export function ActorModal({ personId, onClose, appIds }: ActorModalProps) {
  const [, setLocation] = useLocation();
  const params = { personId: String(personId ?? 0) };
  const { data: person, isLoading } = useGetTmdbPerson(params, {
    query: {
      enabled: personId !== null,
      queryKey: getGetTmdbPersonQueryKey(params),
    },
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleCreditClick = (credit: { id: number; mediaType: string }) => {
    const type = credit.mediaType === "tv" ? "serie" : "movie";
    onClose();
    setLocation(`/detail/${type}/${credit.id}`);
  };

  return (
    <AnimatePresence>
      {personId !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-[#141414] rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[92vh] overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 flex-shrink-0">
              <h2 className="text-sm font-black uppercase tracking-widest text-white">
                {person?.name || "Cargando..."}
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/12 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 scrollbar-hide px-5 pb-8">
              {isLoading ? (
                <div className="space-y-4 pt-2">
                  <div className="flex gap-4">
                    <div className="w-24 h-32 rounded-xl bg-white/8 animate-pulse flex-shrink-0" />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-3 bg-white/8 animate-pulse rounded w-1/2" />
                      <div className="h-3 bg-white/8 animate-pulse rounded w-1/3" />
                      <div className="h-3 bg-white/8 animate-pulse rounded w-full" />
                    </div>
                  </div>
                </div>
              ) : person ? (
                <div className="space-y-7">
                  {/* Profile */}
                  <div className="flex gap-4">
                    {person.profilePath ? (
                      <img
                        src={person.profilePath}
                        alt={person.name}
                        className="w-24 h-32 rounded-xl object-cover flex-shrink-0 ring-1 ring-white/10"
                      />
                    ) : (
                      <div className="w-24 h-32 rounded-xl bg-white/8 flex-shrink-0 flex items-center justify-center text-white/20 text-3xl font-bold">
                        {person.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0 pt-1 space-y-2">
                      {person.knownFor && (
                        <p className="text-[#A855F7] text-xs font-black uppercase tracking-widest">
                          {person.knownFor === "Acting" ? "Acting" : person.knownFor}
                        </p>
                      )}
                      {person.birthday && (
                        <p className="flex items-center gap-1.5 text-xs text-white/40">
                          <Calendar className="w-3 h-3" />
                          {person.birthday}
                        </p>
                      )}
                      {person.placeOfBirth && (
                        <p className="flex items-center gap-1.5 text-xs text-white/40">
                          <MapPin className="w-3 h-3" />
                          {person.placeOfBirth}
                        </p>
                      )}
                      {person.biography ? (
                        <p className="text-white/55 text-xs leading-relaxed line-clamp-4">
                          {person.biography}
                        </p>
                      ) : (
                        <p className="text-white/25 text-xs italic">Sin biografía disponible.</p>
                      )}
                    </div>
                  </div>

                  {/* Filmography */}
                  {person.credits && person.credits.length > 0 && (
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-white/50 mb-4">
                        Conocido por
                      </h3>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {person.credits.slice(0, 16).map((credit) => {
                          const isInApp = appIds?.has(String(credit.id));
                          return (
                            <button
                              key={`${credit.id}-${credit.mediaType}`}
                              onClick={() => handleCreditClick(credit)}
                              className={`group text-left transition-all duration-200 ${isInApp ? "opacity-100" : "opacity-60 hover:opacity-80"}`}
                            >
                              <div className={`relative aspect-[2/3] rounded-lg overflow-hidden bg-white/5 mb-1.5 ${isInApp ? "ring-1 ring-[#A855F7]/60" : ""}`}>
                                {credit.posterPath ? (
                                  <img
                                    src={credit.posterPath}
                                    alt={credit.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-white/20 text-2xl font-bold">
                                    ?
                                  </div>
                                )}
                                {/* Year badge */}
                                {credit.year && (
                                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-1.5 pb-1 pt-4">
                                    <span className="text-[9px] text-white/70 font-bold">{credit.year}</span>
                                  </div>
                                )}
                                {/* In-app badge */}
                                {isInApp && (
                                  <div className="absolute top-1.5 right-1.5">
                                    <div className="w-2 h-2 rounded-full bg-[#A855F7] shadow-lg shadow-[#A855F7]/60" />
                                  </div>
                                )}
                              </div>
                              <p className="text-white/75 text-[10px] leading-tight line-clamp-2 font-medium">{credit.title}</p>
                              {credit.character && (
                                <p className="text-white/30 text-[9px] leading-tight line-clamp-1 mt-0.5 italic">{credit.character}</p>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-white/30 text-sm py-12">
                  No se encontraron datos para este actor.
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
