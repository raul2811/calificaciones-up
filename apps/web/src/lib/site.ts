import { getEnv } from "@/shared/config/env";

function requireSiteUrl(value: string): string {
  const raw = value.trim() || "https://example.invalid";

  try {
    return new URL(raw).toString().replace(/\/$/, "");
  } catch {
    return "https://example.invalid";
  }
}

export const siteConfig = {
  name: "Calificaciones UP",
  description:
    "Plataforma academica para consultar calificaciones, avance academico, profesores y resumen del expediente academico relacionado con la Secretaria Virtual de la Universidad de Panama.",
  siteUrl: requireSiteUrl(getEnv().siteUrl),
};

export function getCanonicalUrl(path = "/"): string {
  return new URL(path, `${siteConfig.siteUrl}/`).toString();
}
