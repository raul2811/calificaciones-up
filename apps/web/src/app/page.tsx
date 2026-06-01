import type { Metadata } from "next";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCanonicalUrl, siteConfig } from "@/lib/site";

const moduleCards = [
  {
    name: "Dashboard",
    href: "/dashboard",
    description: "Resumen académico y financiero con indicadores y accesos directos.",
  },
  {
    name: "Plan de estudios",
    href: "/plan",
    description: "Expediente completo con filtros, ordenamiento y exportación.",
  },
  {
    name: "Pendientes",
    href: "/pendientes",
    description: "Materias no resueltas, bloqueos y prioridades de avance.",
  },
  {
    name: "Analytics",
    href: "/analytics",
    description: "Distribuciones de estado, notas, créditos y avance real.",
  },
  {
    name: "Recovery",
    href: "/recovery",
    description: "Seguimiento de intentos, recuperación y materias repetidas.",
  },
  {
    name: "Profesores",
    href: "/profesores",
    description: "Asignaciones docentes por materia y período académico.",
  },
  {
    name: "Morosidad",
    href: "/morosidad",
    description: "Estado financiero, registros y validación de paz y salvo.",
  },
  {
    name: "Perfil",
    href: "/perfil",
    description: "Ficha del estudiante con resumen general del expediente.",
  },
];

const faqs = [
  {
    question: "¿Qué es Calificaciones UP?",
    answer:
      "Es una plataforma web para consultar información académica de estudiantes de la Universidad de Panamá con una interfaz más clara que la consulta tradicional.",
  },
  {
    question: "¿Reemplaza la Secretaría Virtual?",
    answer:
      "No. Funciona como una capa de lectura y visualización. Mantiene los contratos y credenciales existentes.",
  },
  {
    question: "¿Qué puedo revisar dentro de la plataforma?",
    answer:
      "Dashboard, plan académico, pendientes, analytics, recovery, profesores, morosidad y perfil del estudiante.",
  },
  {
    question: "¿Está pensada solo para escritorio?",
    answer:
      "No. La experiencia está optimizada para móvil, tablet y escritorio sin desbordes horizontales innecesarios.",
  },
];

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

const websiteStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  description: siteConfig.description,
  url: siteConfig.siteUrl,
  inLanguage: "es",
};

const applicationStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: siteConfig.name,
  url: siteConfig.siteUrl,
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web",
  inLanguage: "es",
  description: siteConfig.description,
};

export const metadata: Metadata = {
  title: "Calificaciones UP | Plataforma académica para estudiantes de la Universidad de Panamá",
  description:
    "Consulta calificaciones, avance académico, materias pendientes, profesores y morosidad en una interfaz más clara para estudiantes de la Universidad de Panamá.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Calificaciones UP | Plataforma académica para estudiantes de la Universidad de Panamá",
    description: siteConfig.description,
    url: getCanonicalUrl("/"),
  },
  twitter: {
    title: "Calificaciones UP | Plataforma académica para estudiantes de la Universidad de Panamá",
    description: siteConfig.description,
  },
};

export default function HomePage() {
  return (
    <main id="contenido" className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <a href="#contenido" className="skip-link">
        Saltar al contenido principal
      </a>

      <header className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <Link href="/" aria-label="Ir al inicio de Calificaciones UP" className="landing-brand">
            <span className="landing-brand-mark">UP</span>
            <span>Calificaciones UP</span>
          </Link>

          <nav aria-label="Navegación principal" className="flex flex-wrap items-center gap-2 text-sm">
            {[
              ["#plataforma", "Plataforma"],
              ["#modulos", "Módulos"],
              ["#preguntas", "Preguntas"],
            ].map(([href, label]) => (
              <Link key={href} href={href} className="landing-nav-link">
                {label}
              </Link>
            ))}
            <Link href="/login" className="landing-button landing-button-primary">
              Iniciar sesión
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)] lg:px-8 lg:py-20">
        <div className="self-center">
          <p className="landing-eyebrow">Consulta académica para estudiantes</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-primary sm:text-5xl">
            Una vista más clara del expediente académico de la Universidad de Panamá
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-foreground-soft sm:text-lg">
            Calificaciones UP organiza notas, avance, pendientes, recovery, profesores y morosidad en una interfaz sobria, responsive y pensada para revisar información real con menos fricción.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/login" className="landing-button landing-button-primary">
              Entrar a la plataforma
            </Link>
            <Link href="#modulos" className="landing-button landing-button-secondary">
              Ver módulos
            </Link>
          </div>

          <dl className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="surface-panel rounded-xl p-4">
              <dt className="text-sm text-foreground-muted">Módulos disponibles</dt>
              <dd className="mt-2 text-2xl font-semibold text-primary">{moduleCards.length}</dd>
            </div>
            <div className="surface-panel rounded-xl p-4">
              <dt className="text-sm text-foreground-muted">Consulta académica</dt>
              <dd className="mt-2 text-2xl font-semibold text-primary">Notas, plan y avance</dd>
            </div>
            <div className="surface-panel rounded-xl p-4">
              <dt className="text-sm text-foreground-muted">Acceso</dt>
              <dd className="mt-2 text-2xl font-semibold text-primary">Credenciales existentes</dd>
            </div>
          </dl>
        </div>

        <aside aria-label="Vista previa de la plataforma" className="dashboard-preview rounded-xl p-5 text-slate-50">
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <p className="text-xs uppercase tracking-[0.08em] text-slate-300">Panel académico</p>
                <p className="mt-1 text-lg font-semibold text-white">Resumen del estudiante</p>
              </div>
              <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
                Expediente actualizado
              </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                ["Plan", "Historial académico"],
                ["Pendientes", "Bloqueos y alertas"],
                ["Analytics", "Distribuciones reales"],
                ["Morosidad", "Estado financiero"],
              ].map(([label, detail]) => (
                <div key={label} className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold text-white">{label}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <section id="plataforma" className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            "Reduce tiempo de lectura frente a vistas fragmentadas.",
            "Mantiene navegación clara entre datos académicos y financieros.",
            "Prioriza legibilidad, filtros y estados útiles en móvil y escritorio.",
          ].map((item) => (
            <div key={item} className="landing-panel rounded-xl p-5">
              <p className="text-sm leading-7 text-foreground-soft">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="modulos" className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
        <div className="flex flex-col gap-3">
          <p className="landing-eyebrow">Módulos</p>
          <h2 className="text-3xl font-semibold tracking-tight text-primary">Todo el flujo académico en una sola navegación</h2>
          <p className="max-w-3xl text-base leading-8 text-foreground-soft">
            Cada vista está enfocada en una tarea concreta: revisar el avance, detectar bloqueos, validar registros financieros o explorar distribuciones del expediente.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {moduleCards.map((moduleCard) => (
            <Card key={moduleCard.href} className="rounded-xl">
              <CardHeader>
                <CardTitle>{moduleCard.name}</CardTitle>
                <CardDescription>{moduleCard.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={moduleCard.href} className="landing-button landing-button-secondary w-full">
                  Abrir módulo
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="preguntas" className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.85fr)]">
          <div>
            <p className="landing-eyebrow">Preguntas frecuentes</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-primary">Lo esencial antes de entrar</h2>
            <div className="mt-6 space-y-4">
              {faqs.map((item) => (
                <article key={item.question} className="landing-panel rounded-xl p-5">
                  <h3 className="text-base font-semibold text-primary">{item.question}</h3>
                  <p className="mt-2 text-sm leading-7 text-foreground-soft">{item.answer}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="landing-panel rounded-xl p-6">
            <p className="landing-eyebrow">Acceso rápido</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-primary">Entrar y navegar</h2>
            <p className="mt-3 text-sm leading-7 text-foreground-soft">
              La plataforma reutiliza las credenciales actuales del estudiante y distribuye la información en módulos con navegación directa.
            </p>
            <div className="mt-6 space-y-3">
              {[
                ["/login", "Ir a inicio de sesión"],
                ["/dashboard", "Abrir dashboard"],
                ["/plan", "Ver plan de estudios"],
                ["/analytics", "Explorar analytics"],
              ].map(([href, label]) => (
                <Link key={href} href={href} className="landing-list-link">
                  <span>{label}</span>
                  <span aria-hidden="true">→</span>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <footer className="border-t border-[var(--border)] bg-[var(--card)]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-foreground-muted sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>{siteConfig.name}</p>
          <p>Plataforma académica para consulta del expediente estudiantil.</p>
        </div>
      </footer>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(applicationStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
    </main>
  );
}
