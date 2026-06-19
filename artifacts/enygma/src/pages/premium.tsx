import { motion } from "framer-motion";
import { Check, Zap, Shield, Tv, Star, MessageCircle, Play, X } from "lucide-react";
import { Layout } from "@/components/layout";

const WA_LINK =
  "https://wa.me/543417195165?text=Hola%21%20Quiero%20contratar%20ENYGMA%20Premium%20%F0%9F%8E%AC";

const BENEFITS = [
  { icon: Zap, text: "Sin publicidades", desc: "Disfruta sin interrupciones" },
  { icon: Tv, text: "Calidad HD y 4K", desc: "La mejor resolución disponible" },
  { icon: Shield, text: "Acceso prioritario", desc: "Nuevos estrenos antes que nadie" },
  { icon: Star, text: "Contenido exclusivo VIP", desc: "Títulos solo para miembros premium" },
  { icon: Play, text: "Reproducción ilimitada", desc: "Sin cortes, sin límites" },
  { icon: MessageCircle, text: "Soporte directo", desc: "Asistencia personalizada vía WhatsApp" },
];

const FREE_FEATURES = [
  { label: "Catálogo completo", free: true, premium: true },
  { label: "Calidad de video", free: "Normal", premium: "HD / 4K" },
  { label: "Publicidades", free: true, premium: false },
  { label: "Contenido VIP", free: false, premium: true },
  { label: "Acceso anticipado a estrenos", free: false, premium: true },
  { label: "Soporte prioritario", free: false, premium: true },
];

export default function Premium() {
  return (
    <Layout>
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% -10%, #A855F7 0%, transparent 70%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black" />

        <div className="relative max-w-screen-2xl mx-auto px-4 md:px-10 lg:px-16 xl:px-20 pt-16 pb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-[#A855F7]/20 border border-[#A855F7]/40 text-[#A855F7] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
              <Star className="w-3 h-3 fill-current" />
              ENYGMA PREMIUM
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-display uppercase tracking-tight text-white mb-4 leading-none">
              La Mejor
              <br />
              <span className="text-[#A855F7]">Experiencia</span>
            </h1>
            <p className="text-white/50 text-base md:text-lg max-w-xl mx-auto mb-12">
              Disfruta ENYGMA sin límites. Sin publicidades, con calidad premium y contenido exclusivo.
            </p>
          </motion.div>

          {/* Pricing Cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-stretch max-w-2xl mx-auto mb-12"
          >
            {/* Free */}
            <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-6 text-left">
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-3">Gratis</p>
              <div className="mb-4">
                <span className="text-4xl font-bold font-display text-white">$0</span>
                <span className="text-white/30 text-sm ml-2">/ mes</span>
              </div>
              <ul className="space-y-2.5 mb-6">
                {FREE_FEATURES.map((f) => (
                  <li key={f.label} className="flex items-center gap-2.5 text-sm">
                    {typeof f.free === "boolean" ? (
                      f.free ? (
                        <Check className="w-4 h-4 text-white/40 flex-shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-white/20 flex-shrink-0" />
                      )
                    ) : (
                      <Check className="w-4 h-4 text-white/40 flex-shrink-0" />
                    )}
                    <span className={`${!f.free ? "text-white/25 line-through" : "text-white/50"}`}>
                      {f.label}
                      {typeof f.free === "string" && (
                        <span className="text-white/30 ml-1">({f.free})</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="text-center text-white/20 text-sm font-medium py-2 border border-white/10 rounded-xl">
                Plan actual
              </div>
            </div>

            {/* Premium */}
            <div className="flex-1 bg-gradient-to-b from-[#A855F7]/20 to-[#800000]/10 border border-[#A855F7]/50 rounded-2xl p-6 text-left relative overflow-hidden">
              <div className="absolute top-3 right-3">
                <span className="bg-[#A855F7] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                  POPULAR
                </span>
              </div>
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle at 80% 20%, #A855F7 0%, transparent 60%)",
                }}
              />
              <p className="text-[#A855F7] text-xs font-bold uppercase tracking-widest mb-3">Premium</p>
              <div className="mb-1">
                <span className="text-4xl font-bold font-display text-white">$3</span>
                <span className="text-white/50 text-sm ml-2">USD / mes</span>
              </div>
              <p className="text-white/30 text-sm mb-5">o $4.000 pesos argentinos</p>
              <ul className="space-y-2.5 mb-6">
                {FREE_FEATURES.map((f) => (
                  <li key={f.label} className="flex items-center gap-2.5 text-sm">
                    <Check className="w-4 h-4 text-[#A855F7] flex-shrink-0" />
                    <span className="text-white">
                      {f.label}
                      {typeof f.premium === "string" && (
                        <span className="text-[#A855F7] ml-1 font-semibold">({f.premium})</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
              <a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 w-full bg-[#25D366] hover:bg-[#20b858] text-white font-bold py-3 rounded-xl transition-all active:scale-95 shadow-lg shadow-green-900/30"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white flex-shrink-0">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Contratar por WhatsApp
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Benefits Grid */}
      <div className="max-w-screen-2xl mx-auto px-4 md:px-10 lg:px-16 xl:px-20 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold font-display uppercase tracking-wider text-center mb-3">
            Todo lo que incluye
          </h2>
          <p className="text-white/30 text-center text-sm mb-10">Una suscripción, beneficios sin límites.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BENEFITS.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.07 }}
                className="flex items-start gap-4 bg-white/4 hover:bg-white/6 border border-white/8 hover:border-[#A855F7]/30 rounded-xl p-5 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-[#A855F7]/15 border border-[#A855F7]/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#A855F7]/25 transition-colors">
                  <benefit.icon className="w-5 h-5 text-[#A855F7]" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{benefit.text}</p>
                  <p className="text-white/35 text-xs mt-0.5">{benefit.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom CTA */}
      <div className="max-w-screen-2xl mx-auto px-4 md:px-10 lg:px-16 xl:px-20 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#A855F7]/25 via-[#800000]/15 to-transparent border border-[#A855F7]/25 p-8 md:p-12 text-center"
        >
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% 100%, #A855F7 0%, transparent 70%)",
            }}
          />
          <div className="relative">
            <img
              src="/logo.png"
              alt="ENYGMA"
              className="w-16 h-16 rounded-2xl mx-auto mb-4 shadow-2xl"
            />
            <h3 className="text-2xl md:text-3xl font-bold font-display uppercase mb-2">
              Empieza hoy mismo
            </h3>
            <p className="text-white/40 text-sm mb-6 max-w-sm mx-auto">
              Escríbenos por WhatsApp y activa tu cuenta Premium en minutos.
            </p>
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#20b858] text-white font-bold text-base px-8 py-4 rounded-2xl transition-all active:scale-95 shadow-xl shadow-green-900/30"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white flex-shrink-0">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Contratar ENYGMA Premium
              <span className="text-white/70 text-sm font-normal">— $3 USD / $4.000 ARS</span>
            </a>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
