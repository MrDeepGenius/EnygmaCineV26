import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, MessageCircle } from "lucide-react";
import { useListMovies, useListSeries, useListAnime } from "@workspace/api-client-react";
import { useProfile } from "@/lib/profile-context";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ContentItem {
  titulo: string;
  genero: string;
  sinopsis: string;
  actores: string;
  tipo: string;
  año: string;
  valoracion: number;
}

export function EnygbotChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "¡Hola! Soy ENYGBOT 🤖. Pregúntame por películas, series o anime. Puedo buscar por género, actores, año, o simplemente recomendar lo mejor. ¿Qué buscas?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { profile } = useProfile();

  // Traer películas, series y anime
  const { data: moviesData = {} } = useListMovies({ profile: profile || undefined, limit: 200 });
  const { data: seriesData = {} } = useListSeries({ profile: profile || undefined, limit: 200 });
  const { data: animeData = {} } = useListAnime({ profile: profile || undefined, limit: 200 });

  const movies = (moviesData as any).items || [];
  const series = (seriesData as any).items || [];
  const anime = (animeData as any).items || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getRecommendations = (userInput: string): string => {
    const input = userInput.toLowerCase();

    // Compilar todo el contenido
    const allContent: ContentItem[] = [
      ...movies.map((m: any) => ({
        titulo: m.titulo,
        genero: m.genero || "",
        sinopsis: m.sinopsis || "",
        actores: m.actores || "",
        tipo: "película",
        año: m.año || "",
        valoracion: parseFloat(m.valoracion) || 0,
      })),
      ...series.map((s: any) => ({
        titulo: s.titulo,
        genero: s.genero || "",
        sinopsis: s.sinopsis || "",
        actores: s.actores || "",
        tipo: "serie",
        año: s.año || "",
        valoracion: parseFloat(s.valoracion) || 0,
      })),
      ...anime.map((a: any) => ({
        titulo: a.titulo,
        genero: a.genero || "",
        sinopsis: a.sinopsis || "",
        actores: a.actores || "",
        tipo: "anime",
        año: a.año || "",
        valoracion: parseFloat(a.valoracion) || 0,
      })),
    ];

    if (allContent.length === 0) {
      return "No tengo películas disponibles. ¡Vuelve pronto!";
    }

    // TOP - Mostrar ranking
    if (input.includes("top") || input.includes("ranking") || input.includes("mejores")) {
      const top = allContent
        .filter(item => item.valoracion > 0)
        .sort((a, b) => b.valoracion - a.valoracion)
        .slice(0, 5);

      if (top.length === 0) {
        return "TOP 5: Sin datos de valoración disponibles.";
      }

      const titles = top.map((r, i) => `${i + 1}. ${r.titulo} ⭐${r.valoracion}`).join("\n");
      return `🏆 TOP 5 MÁS VALORADOS:\n${titles}`;
    }

    // Sistema de puntuación avanzado
    const scored = allContent.map(item => {
      let score = 0;

      // 1. BÚSQUEDA POR ACTORES
      const actoresLower = item.actores.toLowerCase();
      const actorKeywords = input.split(" ").filter(w => w.length > 2);
      actorKeywords.forEach(keyword => {
        if (actoresLower.includes(keyword)) score += 25; // Alta prioridad para actores
      });

      // 2. BÚSQUEDA POR AÑO
      const yearMatch = input.match(/\d{4}/);
      if (yearMatch && item.año.includes(yearMatch[0])) {
        score += 20;
      }

      // 3. BÚSQUEDA POR GÉNERO
      const genresLower = item.genero.toLowerCase();
      const genres = item.genero.toLowerCase().split(",").map(g => g.trim());
      genres.forEach(genre => {
        if (input.includes(genre)) score += 15;
      });

      // 4. PALABRAS CLAVE EN SINOPSIS
      const synopsisLower = item.sinopsis.toLowerCase();
      const keywordMatches = [
        { word: "acción", score: 10 },
        { word: "aventura", score: 10 },
        { word: "drama", score: 10 },
        { word: "comedia", score: 10 },
        { word: "terror", score: 10 },
        { word: "horror", score: 10 },
        { word: "romance", score: 8 },
        { word: "misterio", score: 8 },
        { word: "suspenso", score: 8 },
        { word: "ciencia ficción", score: 10 },
        { word: "futuro", score: 5 },
        { word: "espacio", score: 5 },
        { word: "magia", score: 8 },
        { word: "superhéroes", score: 10 },
        { word: "animado", score: 12 },
        { word: "infantil", score: 8 },
      ];

      keywordMatches.forEach(({ word, score: pts }) => {
        if (input.includes(word) && synopsisLower.includes(word)) score += pts;
      });

      // 5. COINCIDENCIAS EN TÍTULO
      if (item.titulo.toLowerCase().includes(input)) score += 20;

      // 6. BÚSQUEDA PARCIAL EN TÍTULO
      const titleWords = item.titulo.toLowerCase().split(" ");
      titleWords.forEach(word => {
        if (input.includes(word) && word.length > 3) score += 5;
      });

      // 7. BÚSQUEDA EN SINOPSIS (palabras clave del usuario)
      const userWords = input.split(" ").filter(w => w.length > 3);
      userWords.forEach(word => {
        if (synopsisLower.includes(word)) score += 3;
      });

      // 8. VALORACIÓN COMO FACTOR
      score += item.valoracion * 0.5;

      // 9. VARIABILIDAD - Factor aleatorio para variar recomendaciones CADA VEZ
      score += Math.random() * 5;

      return { ...item, score };
    });

    // Ordenar por puntuación
    const sorted = scored.sort((a, b) => b.score - a.score);

    // Filtrar los mejores
    const recommended = sorted.filter(item => item.score > 3).slice(0, 4);

    if (recommended.length === 0) {
      const random: ContentItem[] = [];
      for (let i = 0; i < 3; i++) {
        random.push(allContent[Math.floor(Math.random() * allContent.length)]);
      }
      return `No encontré coincidencias exactas, pero creo que te pueden gustar: ${random.map(r => `${r.titulo} (${r.tipo})`).join(", ")}. ¡Pruébalas! 🍿`;
    }

    const titles = recommended.map(r => `${r.titulo} (${r.tipo})${r.valoracion ? ` ⭐${r.valoracion}` : ""}`).join(", ");
    return `¡Perfecto! Te recomiendo: ${titles}. ¡Que las disfrutes! 🎬`;
  };

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userText = input;
    setInput("");
    setLoading(true);

    // Generar respuesta con delay
    setTimeout(() => {
      const reply = getRecommendations(userText);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setLoading(false);
    }, 600);
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-[#A855F7] to-[#9333EA] flex items-center justify-center shadow-lg shadow-[#A855F7]/50 text-white hover:shadow-xl hover:shadow-[#A855F7]/60 transition-all"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden"
            style={{ height: "600px" }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#A855F7] to-[#9333EA] px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-white">ENYGBOT</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-all"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg text-sm whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-[#A855F7] text-white rounded-br-none"
                        : "bg-zinc-800 text-white/80 rounded-bl-none"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-zinc-800 text-white/80 px-4 py-2 rounded-lg rounded-bl-none">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-white/40 animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "0.1s" }} />
                      <div className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "0.2s" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-white/10 p-3 bg-zinc-800/50">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !loading) {
                      sendMessage();
                    }
                  }}
                  placeholder="Busca por género, actor, año..."
                  className="flex-1 bg-zinc-700 text-white placeholder-white/40 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#A855F7]"
                  disabled={loading}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="w-10 h-10 rounded-lg bg-[#A855F7] hover:bg-[#9333EA] disabled:opacity-50 text-white flex items-center justify-center transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
