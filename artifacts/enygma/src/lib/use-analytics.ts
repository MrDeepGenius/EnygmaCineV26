import { useEffect, useState } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export function useAnalytics() {
  const [sessionId, setSessionId] = useState<string>("");

  // Initialize session on mount
  useEffect(() => {
    const stored = localStorage.getItem("enygma_session_id");
    let id = stored || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    if (!stored) {
      localStorage.setItem("enygma_session_id", id);
    }
    
    setSessionId(id);

    // Register initial session
    fetch(`${BASE}/api/analytics/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: id }),
    }).catch(console.error);
  }, []);

  // Track when user watches content
  const trackContent = (contentId: string, contentTitle: string, contentType: "movie" | "serie" | "anime") => {
    if (!sessionId) return;
    
    fetch(`${BASE}/api/analytics/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        contentId,
        contentTitle,
        contentType,
      }),
    }).catch(console.error);
  };

  // Periodic ping to keep session alive
  useEffect(() => {
    if (!sessionId) return;

    const interval = setInterval(() => {
      fetch(`${BASE}/api/analytics/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      }).catch(console.error);
    }, 30000); // Ping every 30 seconds

    return () => clearInterval(interval);
  }, [sessionId]);

  return { sessionId, trackContent };
}
