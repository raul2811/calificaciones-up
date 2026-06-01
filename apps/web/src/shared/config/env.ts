import { z } from "zod";

const envSchema = z.object({
  apiBaseUrl: z.string().min(1, "Missing API base URL"),
  appName: z.string().min(1).default("Calificaciones UP"),
  siteUrl: z.string().min(1).default("https://example.invalid"),
});

export type AppEnv = z.infer<typeof envSchema>;

declare global {
  interface Window {
    __CALIFICACIONES_UP_RUNTIME__?: Partial<{
      apiBaseUrl: string;
      appName: string;
      siteUrl: string;
    }>;
  }
}

let cachedEnv: AppEnv | null = null;

function readRawEnv() {
  const runtime = typeof window !== "undefined" ? window.__CALIFICACIONES_UP_RUNTIME__ : undefined;

  return {
    apiBaseUrl: runtime?.apiBaseUrl?.trim() || import.meta.env.VITE_API_URL?.trim() || "",
    appName: runtime?.appName?.trim() || import.meta.env.VITE_APP_NAME?.trim() || "Calificaciones UP",
    siteUrl:
      runtime?.siteUrl?.trim() ||
      import.meta.env.VITE_SITE_URL?.trim() ||
      (typeof window !== "undefined" ? window.location.origin : "https://example.invalid"),
  };
}

export function getEnv(): AppEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  cachedEnv = envSchema.parse(readRawEnv());
  return cachedEnv;
}
