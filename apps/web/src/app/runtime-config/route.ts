type RuntimeConfigPayload = {
  apiBaseUrl: string;
  appName: string;
  siteUrl: string;
};

function requireEnv(value: string | undefined, name: string): string {
  const trimmed = value?.trim();
  if (!trimmed) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return trimmed;
}

function normalizeSiteUrl(value: string | undefined): string {
  const raw = requireEnv(value, "NEXT_PUBLIC_SITE_URL");
  return new URL(raw).toString().replace(/\/$/, "");
}

function serialize(payload: RuntimeConfigPayload): string {
  return `window.__CALIFICACIONES_UP_RUNTIME__ = ${JSON.stringify(payload).replace(/</g, "\\u003c")};`;
}

export const dynamic = "force-dynamic";

export function GET(): Response {
  const payload: RuntimeConfigPayload = {
    apiBaseUrl: requireEnv(process.env.NEXT_PUBLIC_API_BASE_URL, "NEXT_PUBLIC_API_BASE_URL"),
    appName: process.env.NEXT_PUBLIC_APP_NAME?.trim() || "Calificaciones UP",
    siteUrl: normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
  };

  return new Response(serialize(payload), {
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "Content-Type": "application/javascript; charset=utf-8",
    },
  });
}
