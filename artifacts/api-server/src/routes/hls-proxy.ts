import { Router, type IRouter } from "express";

const router: IRouter = Router();

const PROXY_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Referer: "https://vimeos.net/",
  Origin: "https://vimeos.net",
  Accept: "*/*",
  "Accept-Language": "es-AR,es;q=0.9,en;q=0.8",
};

function makeProxyUrl(originalUrl: string): string {
  return `/api/hls-proxy?url=${encodeURIComponent(originalUrl)}`;
}

function resolveRelativeUrl(base: string, relative: string): string {
  try {
    return new URL(relative, base).toString();
  } catch {
    return relative;
  }
}

function rewriteM3u8(content: string, manifestUrl: string): string {
  const lines = content.split("\n");
  const rewritten: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Rewrite URI= attributes in tags like EXT-X-KEY, EXT-X-MEDIA, EXT-X-MAP, etc.
    if (trimmed.startsWith("#") && trimmed.includes('URI="')) {
      const rewrittenLine = trimmed.replace(/URI="([^"]+)"/g, (_, uri) => {
        const abs = resolveRelativeUrl(manifestUrl, uri);
        return `URI="${makeProxyUrl(abs)}"`;
      });
      rewritten.push(rewrittenLine);
      continue;
    }

    // Rewrite segment lines (non-empty, non-comment)
    if (trimmed && !trimmed.startsWith("#")) {
      const abs = resolveRelativeUrl(manifestUrl, trimmed);
      rewritten.push(makeProxyUrl(abs));
      continue;
    }

    rewritten.push(line);
  }

  return rewritten.join("\n");
}

router.get("/hls-proxy", async (req, res): Promise<void> => {
  const url = req.query.url as string | undefined;
  if (!url) {
    res.status(400).send("Missing url param");
    return;
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(url);
  } catch {
    res.status(400).send("Invalid url");
    return;
  }

  try {
    const upstream = await fetch(targetUrl.toString(), { headers: PROXY_HEADERS });

    if (!upstream.ok) {
      res.status(upstream.status).send(`Upstream error: ${upstream.status}`);
      return;
    }

    const ct = upstream.headers.get("content-type") || "";
    const isM3u8 = ct.includes("mpegurl") || ct.includes("m3u8") || url.includes(".m3u8");

    // Forward CORS headers so the browser can use the response
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Cache-Control", "no-cache");

    if (isM3u8) {
      const text = await upstream.text();
      const rewritten = rewriteM3u8(text, url);
      res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      res.send(rewritten);
    } else {
      // Stream binary (TS segments, key files, etc.)
      res.setHeader("Content-Type", ct || "application/octet-stream");
      const len = upstream.headers.get("content-length");
      if (len) res.setHeader("Content-Length", len);

      const buffer = await upstream.arrayBuffer();
      res.send(Buffer.from(buffer));
    }
  } catch (err) {
    req.log.error({ err, url }, "hls-proxy error");
    res.status(502).send("Proxy fetch failed");
  }
});

// Handle CORS preflight
router.options("/hls-proxy", (_, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.status(204).end();
});

export default router;
