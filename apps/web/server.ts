import path from "node:path";
import { fileURLToPath } from "node:url";

const serverDir = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(serverDir, "dist");
const indexPath = path.join(distDir, "index.html");
const allowedMethods = new Set(["GET", "HEAD"]);

const port = Number(process.env.PORT || "3000");
const hostname = process.env.HOSTNAME || "0.0.0.0";

declare const Bun: {
  file(filePath: string): Blob & { exists(): Promise<boolean> };
  serve(options: {
    hostname: string;
    port: number;
    fetch(request: Request): Response | Promise<Response>;
  }): {
    stop(): void | Promise<void>;
  };
};

function runtimeConfig() {
  const apiBaseUrl =
    process.env.VITE_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
    "";
  const appName =
    process.env.VITE_APP_NAME?.trim() ||
    process.env.NEXT_PUBLIC_APP_NAME?.trim() ||
    "Calificaciones UP";
  const siteUrl =
    process.env.VITE_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "https://example.invalid";

  return {
    apiBaseUrl,
    appName,
    siteUrl,
  };
}

function runtimeConfigScript() {
  const payload = runtimeConfig();

  return `window.__CALIFICACIONES_UP_RUNTIME__ = ${JSON.stringify(payload).replace(/</g, "\\u003c")};`;
}

function originFromUrl(url: string) {
  if (!url) {
    return null;
  }

  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:") {
      return parsedUrl.origin;
    }
  } catch {
    return null;
  }

  return null;
}

function contentSecurityPolicy() {
  const config = runtimeConfig();
  const connectSources = new Set(["'self'"]);
  const apiOrigin = originFromUrl(config.apiBaseUrl);

  if (apiOrigin) {
    connectSources.add(apiOrigin);
  }

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "script-src 'self'",
    "style-src 'self' https://fonts.googleapis.com 'unsafe-inline'",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' blob: data:",
    `connect-src ${Array.from(connectSources).join(" ")}`,
  ].join("; ");
}

function baseHeaders() {
  return new Headers({
    "Content-Security-Policy": contentSecurityPolicy(),
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
    "Permissions-Policy":
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=(), fullscreen=(self)",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
  });
}

function response(
  request: Request,
  body: BodyInit | null,
  init: ResponseInit = {},
) {
  const headers = baseHeaders();
  const customHeaders = new Headers(init.headers);

  customHeaders.forEach((value, key) => {
    headers.set(key, value);
  });

  return new Response(request.method === "HEAD" ? null : body, {
    ...init,
    headers,
  });
}

function contentType(filePath: string) {
  const extension = path.extname(filePath).toLowerCase();

  switch (extension) {
    case ".css":
      return "text/css; charset=utf-8";
    case ".js":
      return "text/javascript; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    case ".svg":
      return "image/svg+xml";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".woff2":
      return "font/woff2";
    case ".html":
    default:
      return "text/html; charset=utf-8";
  }
}

function cacheControl(filePath: string) {
  const normalizedPath = filePath.split(path.sep).join("/");

  if (normalizedPath.includes("/assets/")) {
    return "public, max-age=31536000, immutable";
  }

  return "no-store, max-age=0";
}

async function serveFile(request: Request, filePath: string) {
  const file = Bun.file(filePath);

  if (!(await file.exists())) {
    return null;
  }

  return response(request, file, {
    headers: {
      "Cache-Control": cacheControl(filePath),
      "Content-Type": contentType(filePath),
    },
  });
}

function hasFileExtension(pathname: string) {
  return path.extname(pathname) !== "";
}

function blockedPath(pathname: string) {
  let decodedPath: string;

  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    return true;
  }

  const normalizedPath = decodedPath.split("\\").join("/").toLowerCase();

  if (normalizedPath.includes("\0") || normalizedPath.includes("../")) {
    return true;
  }

  return (
    normalizedPath.startsWith("/@vite") ||
    normalizedPath.startsWith("/@fs") ||
    normalizedPath.startsWith("/node_modules") ||
    normalizedPath.startsWith("/src") ||
    normalizedPath.startsWith("/.vite") ||
    normalizedPath.split("/").some((segment) => segment.startsWith("."))
  );
}

function resolveAssetPath(pathname: string) {
  let decodedPath: string;

  try {
    decodedPath = decodeURIComponent(pathname === "/" ? "/index.html" : pathname);
  } catch {
    return null;
  }

  const assetPath = path.resolve(distDir, decodedPath.replace(/^\/+/, ""));
  const relativePath = path.relative(distDir, assetPath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    return null;
  }

  return assetPath;
}

const server = Bun.serve({
  hostname,
  port,
  async fetch(request) {
    const url = new URL(request.url);

    if (!allowedMethods.has(request.method)) {
      return response(request, "Method Not Allowed", {
        status: 405,
        headers: {
          Allow: "GET, HEAD",
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
    }

    if (blockedPath(url.pathname)) {
      return response(request, "Not Found", {
        status: 404,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
    }

    if (url.pathname === "/runtime-config.js") {
      return response(request, runtimeConfigScript(), {
        headers: {
          "Cache-Control": "no-store, max-age=0",
          "Content-Type": "application/javascript; charset=utf-8",
        },
      });
    }

    const assetPath = resolveAssetPath(url.pathname);
    const assetResponse = assetPath ? await serveFile(request, assetPath) : null;

    if (assetResponse) {
      return assetResponse;
    }

    if (hasFileExtension(url.pathname)) {
      return response(request, "Not Found", {
        status: 404,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
    }

    return response(request, Bun.file(indexPath), {
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  },
});

function shutdown() {
  void Promise.resolve(server.stop()).finally(() => {
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

console.log(`Calificaciones UP web listening on http://${hostname}:${port}`);
