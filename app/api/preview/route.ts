import { NextRequest, NextResponse } from "next/server";
import dns from "dns/promises";

type PreviewData = {
  provider?: string;
  url: string;
  title?: string;
  description?: string;
  images?: string[];
  html?: string; // oEmbed html if available
  mediaType?: string; // 'video'|'audio'|'image'|'link'
};

const CACHE_TTL = 1000 * 60 * 60; // 1 hour
const cache = new Map<string, { ts: number; data: PreviewData }>();

const BLOCKED_IP_RANGES = [
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
];

function isPrivateIP(ip: string) {
  return BLOCKED_IP_RANGES.some((r) => r.test(ip));
}

function normalizeUrl(u: string) {
  try {
    return new URL(u).toString();
  } catch {
    // try to prepend https
    try {
      return new URL("https://" + u).toString();
    } catch {
      return u;
    }
  }
}

function detectProvider(url: string) {
  try {
    const u = new URL(url);
    const host = u.hostname.replace("www.", "");
    if (host.includes("youtube.com") || host.includes("youtu.be"))
      return "youtube";
    if (host.includes("tiktok.com")) return "tiktok";
    if (host.includes("spotify.com")) return "spotify";
    // if (host.includes("open.spotify.com")) return "spotify";
    if (host.includes("soundcloud.com")) return "soundcloud";
    if (host.includes("twitter.com") || host.includes("x.com"))
      return "twitter";
    if (host.includes("instagram.com")) return "instagram";
    return "generic";
  } catch {
    return "generic";
  }
}

async function fetchOEmbed(oembedUrl: string) {
  const res = await fetch(oembedUrl, {
    headers: { "User-Agent": "FoxyoPreview/1.0 (+https://example.com)" },
    // timeout not available in fetch in some runtimes; keep request short server-side
  });
  if (!res.ok) throw new Error(`oembed ${res.status}`);
  const json = await res.json();
  return json;
}

function extractYouTubeId(url: string) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
    if (u.hostname.includes("youtube.com")) return u.searchParams.get("v");
  } catch {}
  return null;
}

export async function GET(req: NextRequest) {
  const urlParam = new URL(req.url).searchParams.get("url");
  if (!urlParam)
    return NextResponse.json({ error: "Missing url" }, { status: 400 });

  const url = normalizeUrl(urlParam);

  // Cache hit
  const cached = cache.get(url);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  // Basic validation
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  try {
    const hostname = new URL(url).hostname;
    // SSRF protection: resolve DNS and block private IPs
    const addresses = await dns.lookup(hostname, { all: true }).catch(() => []);
    for (const a of addresses) {
      if (isPrivateIP(a.address)) {
        return NextResponse.json({ error: "Blocked" }, { status: 403 });
      }
    }

    const provider = detectProvider(url);

    let preview: PreviewData | null = null;

    // PROVIDER-SPECIFIC OEmbed endpoints
    try {
      if (provider === "youtube") {
        // attempt youtube oEmbed
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(
          url
        )}&format=json`;
        const json = await fetchOEmbed(oembedUrl).catch(() => null);
        const ytId = extractYouTubeId(url);
        preview = {
          provider: "youtube",
          url,
          title: json?.title || undefined,
          description: json?.author_name ? `${json.author_name}` : undefined,
          images: ytId
            ? [
                `https://i.ytimg.com/vi/${ytId}/maxresdefault.jpg`,
                `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
              ]
            : json?.thumbnail_url
            ? [json.thumbnail_url]
            : [],
          html: json?.html,
          mediaType: "video",
        };
      } else if (provider === "tiktok") {
        const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(
          url
        )}`;
        const json = await fetchOEmbed(oembedUrl).catch(() => null);
        preview = {
          provider: "tiktok",
          url,
          title: json?.title ?? undefined,
          description: undefined,
          images: json?.thumbnail_url ? [json.thumbnail_url] : [],
          html: json?.html,
          mediaType: "video",
        };
      } else if (provider === "spotify") {
        const oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(
          url
        )}`;
        const json = await fetchOEmbed(oembedUrl).catch(() => null);
        preview = {
          provider: "spotify",
          url,
          title: json?.title,
          images: json?.thumbnail_url ? [json.thumbnail_url] : [],
          html: json?.html,
          mediaType: "audio",
        };
      } else if (provider === "soundcloud") {
        const oembedUrl = `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(
          url
        )}`;
        const json = await fetchOEmbed(oembedUrl).catch(() => null);
        preview = {
          provider: "soundcloud",
          url,
          title: json?.title,
          description: undefined,
          images: json?.thumbnail_url ? [json.thumbnail_url] : [],
          html: json?.html,
          mediaType: "audio",
        };
      } else if (provider === "twitter") {
        // Twitter oEmbed
        const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(
          url
        )}&omit_script=1`;
        const json = await fetchOEmbed(oembedUrl).catch(() => null);
        preview = {
          provider: "twitter",
          url,
          title: undefined,
          description: undefined,
          images: json?.thumbnail_url ? [json.thumbnail_url] : [],
          html: json?.html,
          mediaType: "link",
        };
      } else {
        // generic: try simple oEmbed discovery by adding `?format=json` or fetch minimal metadata
        // We'll attempt a HEAD for content-type then a small GET for meta tags if html
        const resHead = await fetch(url, { method: "HEAD" }).catch(() => null);
        const contentType = resHead?.headers.get("content-type") ?? "";
        if (contentType.includes("text/html")) {
          // try getLinkPreview? If not available on runtime, do a small fetch and parse
          // Simple meta fetch (lightweight): fetch first 100KB
          const res = await fetch(url, {
            method: "GET",
            headers: { "User-Agent": "FoxyoPreview/1.0" },
          });
          const txt = await res.text();
          // quick og:title img extraction (na poziomie regex; not perfect but works often)
          const titleMatch =
            txt.match(
              /<meta property=["']og:title["'] content=["']([^"']+)["']/i
            ) || txt.match(/<title[^>]*>([^<]+)<\/title>/i);
          const descMatch =
            txt.match(
              /<meta property=["']og:description["'] content=["']([^"']+)["']/i
            ) ||
            txt.match(
              /<meta name=["']description["'] content=["']([^"']+)["']/i
            );
          const imgMatch =
            txt.match(
              /<meta property=["']og:image["'] content=["']([^"']+)["']/i
            ) ||
            txt.match(
              /<meta name=["']twitter:image["'] content=["']([^"']+)["']/i
            );
          preview = {
            provider: "generic",
            url,
            title: titleMatch ? titleMatch[1] : undefined,
            description: descMatch ? descMatch[1] : undefined,
            images: imgMatch ? [imgMatch[1]] : [],
            mediaType: "link",
          };
        } else {
          preview = {
            provider: "generic",
            url,
            title: undefined,
            images: [],
            mediaType: "link",
          };
        }
      }
    } catch (err) {
      // swallow provider errors and produce a minimal fallback
      preview = {
        provider: "generic",
        url,
        title: undefined,
        images: [],
        mediaType: "link",
      };
    }

    // store cache
    cache.set(url, { ts: Date.now(), data: preview as PreviewData });
    return NextResponse.json(preview);
  } catch (err) {
    console.error("Preview error", err);
    return NextResponse.json({ error: "preview_failed" }, { status: 200 });
  }
}
