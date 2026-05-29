export type RuntimeConfig = {
  apiBaseUrl: string;
  appName: string;
  siteUrl: string;
};

declare global {
  interface Window {
    __CALIFICACIONES_UP_RUNTIME__?: Partial<RuntimeConfig>;
  }
}

export function getRuntimeConfig(): RuntimeConfig {
  if (typeof window === "undefined") {
    throw new Error("Runtime config is only available in the browser.");
  }

  const runtimeConfig = window.__CALIFICACIONES_UP_RUNTIME__;

  if (!runtimeConfig || !runtimeConfig.apiBaseUrl || runtimeConfig.apiBaseUrl.trim() === "") {
    throw new Error("Missing runtime configuration: apiBaseUrl");
  }

  return {
    apiBaseUrl: runtimeConfig.apiBaseUrl,
    appName: runtimeConfig.appName?.trim() || "Calificaciones UP",
    siteUrl: runtimeConfig.siteUrl?.trim() || window.location.origin,
  };
}
