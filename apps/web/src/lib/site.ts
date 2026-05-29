function requireSiteUrl(value: string | undefined): string {
  const raw = value?.trim() || "https://example.invalid";

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
  siteUrl: requireSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
};

export function getCanonicalUrl(path = "/"): string {
  return new URL(path, `${siteConfig.siteUrl}/`).toString();
}
