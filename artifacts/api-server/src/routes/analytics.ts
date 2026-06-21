import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";

const router = Router();

// Archivo de almacenamiento de sesiones
const SESSIONS_PATH = path.join(process.cwd(), "data", "sessions.json");

interface Session {
  id: string;
  ip: string;
  country: string;
  city: string;
  timestamp: number;
  lastActivity: number;
  currentContent?: {
    id: string;
    title: string;
    type: "movie" | "serie" | "anime";
  };
}

// Leer sesiones del archivo
function readSessions(): Session[] {
  try {
    if (fs.existsSync(SESSIONS_PATH)) {
      return JSON.parse(fs.readFileSync(SESSIONS_PATH, "utf-8"));
    }
  } catch (e) {
    console.error("Error reading sessions:", e);
  }
  return [];
}

// Guardar sesiones al archivo
function saveSessions(sessions: Session[]) {
  try {
    fs.writeFileSync(SESSIONS_PATH, JSON.stringify(sessions, null, 2));
  } catch (e) {
    console.error("Error saving sessions:", e);
  }
}

// Obtener geolocalización por IP usando ip-api.com
async function getGeoLocation(ip: string) {
  try {
    // No hacer request a IPs locales
    if (ip.startsWith("127.") || ip.startsWith("192.168.") || ip.startsWith("10.")) {
      return { country: "Local", city: "Local" };
    }
    
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=country,city`, {
      signal: AbortSignal.timeout(3000),
    });
    
    if (!response.ok) {
      return { country: "Unknown", city: "Unknown" };
    }
    
    const data = await response.json() as { country?: string; city?: string };
    return {
      country: data.country || "Unknown",
      city: data.city || "Unknown",
    };
  } catch (e) {
    return { country: "Unknown", city: "Unknown" };
  }
}

// Obtener IP del cliente
function getClientIP(req: Request): string {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() ||
    (req.connection.remoteAddress || "").split("::ffff:")[1] ||
    req.connection.remoteAddress ||
    "Unknown"
  );
}

// Registrar ingreso o actividad
router.post("/analytics/session", async (req: Request, res: Response) => {
  try {
    const { contentId, contentTitle, contentType, sessionId } = req.body;
    const ip = getClientIP(req);
    const sessions = readSessions();
    
    let session = sessions.find((s) => s.id === sessionId);
    
    if (!session) {
      const geo = await getGeoLocation(ip);
      session = {
        id: sessionId || `session_${Date.now()}_${Math.random()}`,
        ip,
        country: geo.country,
        city: geo.city,
        timestamp: Date.now(),
        lastActivity: Date.now(),
      };
      sessions.push(session);
    } else {
      session.lastActivity = Date.now();
    }

    // Actualizar contenido actual si se proporciona
    if (contentId && contentTitle && contentType) {
      session.currentContent = { id: contentId, title: contentTitle, type: contentType };
    }

    saveSessions(sessions);
    res.json({ sessionId: session.id, success: true });
  } catch (e) {
    console.error("Error in analytics/session:", e);
    res.status(500).json({ error: "Error registering session" });
  }
});

// Obtener todas las sesiones activas (últimas 30 minutos)
router.get("/analytics/sessions", (req: Request, res: Response) => {
  try {
    const sessions = readSessions();
    const now = Date.now();
    const thirtyMinutesAgo = now - 30 * 60 * 1000;
    
    // Filtrar sesiones activas
    const activeSessions = sessions.filter((s) => s.lastActivity > thirtyMinutesAgo);
    
    res.json({
      total: activeSessions.length,
      sessions: activeSessions.sort((a, b) => b.lastActivity - a.lastActivity),
    });
  } catch (e) {
    console.error("Error in analytics/sessions:", e);
    res.status(500).json({ error: "Error fetching sessions" });
  }
});

// Limpiar sesiones antiguas (trigger manual)
router.post("/analytics/cleanup", (req: Request, res: Response) => {
  try {
    const sessions = readSessions();
    const now = Date.now();
    const twoHoursAgo = now - 2 * 60 * 60 * 1000;
    
    const active = sessions.filter((s) => s.lastActivity > twoHoursAgo);
    const removed = sessions.length - active.length;
    
    saveSessions(active);
    res.json({ removed, remaining: active.length });
  } catch (e) {
    console.error("Error in analytics/cleanup:", e);
    res.status(500).json({ error: "Error cleaning up sessions" });
  }
});

export default router;
