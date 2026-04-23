const DEFAULT_SITE_URL = "http://localhost:3000";

function normalizeSiteUrl(value?: string): string {
  const raw = value?.trim() || DEFAULT_SITE_URL;

  try {
    return new URL(raw).toString().replace(/\/$/, "");
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export const siteConfig = {
  name: "Calificaciones UP",
  description:
    "Plataforma academica para consultar calificaciones, avance academico, profesores y resumen del expediente academico relacionado con la Secretaria Virtual de la Universidad de Panama.",
  siteUrl: normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
};

export function getCanonicalUrl(path = "/"): string {
  return new URL(path, `${siteConfig.siteUrl}/`).toString();
}
