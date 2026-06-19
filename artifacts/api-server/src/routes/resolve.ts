import { Router, type IRouter } from "express";

const router: IRouter = Router();

function decodePacker(p: string, a: number, c: number, k: string[]): string {
  const toBase = (n: number): string =>
    (n < a ? "" : toBase(Math.floor(n / a))) +
    (n % a > 35 ? String.fromCharCode(n % a + 29) : (n % a).toString(36));
  for (let i = c - 1; i >= 0; i--) {
    if (k[i]) {
      p = p.replace(new RegExp("\\b" + toBase(i) + "\\b", "g"), k[i]);
    }
  }
  return p;
}

function extractHlsFromHtml(html: string): {
  hlsUrl: string;
  tracks: { file: string; label: string; kind: string; default?: boolean }[];
} | null {
  // Find the eval(function(p,a,c,k,e,d){...}('PACKED',RADIX,COUNT,'DICT'.split('|'))) block
  const evalIdx = html.indexOf("eval(function(p,a,c,k,e,d)");
  if (evalIdx === -1) return null;

  const block = html.slice(evalIdx);

  // Extract the packed string — between the first (' and the closing ',RADIX,COUNT,'DICT'.split
  const innerMatch = block.match(/\('((?:[^'\\]|\\.)*)',\s*(\d+),\s*(\d+),\s*'((?:[^'\\]|\\.)*)'\s*\.split/);
  if (!innerMatch) return null;

  const packed = innerMatch[1].replace(/\\'/g, "'").replace(/\\\\/g, "\\");
  const radix = parseInt(innerMatch[2]);
  const count = parseInt(innerMatch[3]);
  const dict = innerMatch[4].split("|");

  const decoded = decodePacker(packed, radix, count, dict);

  // Extract HLS m3u8 URL from sources
  const hlsMatch = decoded.match(/file:\s*["'](https?:\/\/[^"']+\.m3u8[^"']*)/);
  if (!hlsMatch) return null;

  const hlsUrl = hlsMatch[1];

  // Extract subtitle/caption tracks
  const tracks: { file: string; label: string; kind: string; default?: boolean }[] = [];
  const trackRe = /\{file:\s*["']([^"']+\.(?:vtt|srt)[^"']*)["'].*?label:\s*["']([^"']+)["'].*?kind:\s*["']([^"']+)["']/g;
  let m: RegExpExecArray | null;
  while ((m = trackRe.exec(decoded)) !== null) {
    tracks.push({ file: m[1], label: m[2], kind: m[3] });
  }

  // Mark Spanish track as default
  const spIdx = tracks.findIndex(
    (t) =>
      t.label.toLowerCase().includes("español") ||
      t.label.toLowerCase().includes("spanish") ||
      t.label.toLowerCase().includes("spa")
  );
  if (spIdx >= 0) tracks[spIdx].default = true;
  else if (tracks.length > 0) tracks[0].default = true;

  return { hlsUrl, tracks };
}

router.get("/resolve", async (req, res): Promise<void> => {
  const url = req.query.url as string | undefined;
  if (!url) {
    res.status(400).json({ error: "Missing url param" });
    return;
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Referer: "https://vimeos.net/",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "es-AR,es;q=0.9,en;q=0.8",
      },
    });

    if (!response.ok) {
      res.status(404).json({ error: "Embed page not reachable" });
      return;
    }

    const html = await response.text();
    const result = extractHlsFromHtml(html);

    if (!result) {
      res.status(404).json({ error: "Could not extract HLS URL from embed" });
      return;
    }

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "resolve error");
    res.status(500).json({ error: "Failed to resolve video URL" });
  }
});

export default router;
