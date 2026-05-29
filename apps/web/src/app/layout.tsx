import type { Metadata } from "next";
import Script from "next/script";
import "@/styles/globals.css";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: "Calificaciones UP | Plataforma academica para estudiantes de la Universidad de Panama",
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    type: "website",
    locale: "es_PA",
    siteName: siteConfig.name,
    title: "Calificaciones UP | Plataforma academica para estudiantes de la Universidad de Panama",
    description: siteConfig.description,
    url: siteConfig.siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Calificaciones UP | Plataforma academica para estudiantes de la Universidad de Panama",
    description: siteConfig.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeScript = `
    try {
      var savedTheme = window.localStorage.getItem("up-theme");
      if (savedTheme === "dark") {
        document.documentElement.classList.add("theme-dark");
      } else {
        document.documentElement.classList.remove("theme-dark");
      }
    } catch (_error) {}
  `;

  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <Script src="/runtime-config" strategy="beforeInteractive" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {children}
      </body>
    </html>
  );
}
