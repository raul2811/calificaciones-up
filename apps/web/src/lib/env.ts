import { getRuntimeConfig } from "@/lib/runtime-config";

type AppEnv = {
  apiBaseUrl: string;
  appName: string;
  siteUrl: string;
};

function getServerEnv(): AppEnv {
  return {
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "",
    appName: process.env.NEXT_PUBLIC_APP_NAME?.trim() || "Calificaciones UP",
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://example.invalid",
  };
}

export function getEnv(): AppEnv {
  if (typeof window === "undefined") {
    return getServerEnv();
  }

  return getRuntimeConfig();
}
