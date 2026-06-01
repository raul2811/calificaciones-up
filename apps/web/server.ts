import path from "node:path";
import { fileURLToPath } from "node:url";

const serverDir = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(serverDir, "dist");
const indexPath = path.join(distDir, "index.html");

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

function runtimeConfigScript() {
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

  const payload = {
    apiBaseUrl,
    appName,
    siteUrl,
  };

  return `window.__CALIFICACIONES_UP_RUNTIME__ = ${JSON.stringify(payload).replace(/</g, "\\u003c")};`;
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

async function serveFile(filePath: string) {
  const file = Bun.file(filePath);

  if (!(await file.exists())) {
    return null;
  }

  return new Response(file, {
    headers: {
      "Content-Type": contentType(filePath),
    },
  });
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

    if (url.pathname === "/runtime-config.js") {
      return new Response(runtimeConfigScript(), {
        headers: {
          "Cache-Control": "no-store, max-age=0",
          "Content-Type": "application/javascript; charset=utf-8",
        },
      });
    }

    const assetPath = resolveAssetPath(url.pathname);
    const assetResponse = assetPath ? await serveFile(assetPath) : null;

    if (assetResponse) {
      return assetResponse;
    }

    return new Response(Bun.file(indexPath), {
      headers: {
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
