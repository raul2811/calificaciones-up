import type { Metadata } from "next";
import Link from "next/link";

import AnimatedBackground from "@/components/AnimatedBackground";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCanonicalUrl, siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

const moduleCards = [
  {
    name: "Dashboard",
    href: "/dashboard",
    description:
      "Resume el estado académico y financiero con indicadores, progreso, materias críticas y accesos rápidos.",
  },
  {
    name: "Plan",
    href: "/plan",
    description:
      "Ordena y filtra el expediente académico para revisar materias aprobadas, pendientes u observadas.",
  },
  {
    name: "Pendientes",
    href: "/pendientes",
    description:
      "Detecta bloqueos, materias por resolver y puntos que afectan el avance académico.",
  },
  {
    name: "Analytics",
    href: "/analytics",
    description:
      "Visualiza notas con gráficas, rangos de calificación y cruces por año, semestre y estado.",
  },
  {
    name: "Recovery",
    href: "/recovery",
    description:
      "Da seguimiento a recuperaciones, suficiencias, veranos y múltiples intentos.",
  },
  {
    name: "Profesores",
    href: "/profesores",
    description:
      "Consulta asignaciones docentes por materia y periodo para revisar profesores relacionados.",
  },
  {
    name: "Morosidad",
    href: "/morosidad",
    description:
      "Muestra estado de cuenta, paz y salvo y registros financieros vinculados al estudiante.",
  },
  {
    name: "Perfil",
    href: "/perfil",
    description:
      "Presenta datos clave del estudiante, avance porcentual y resumen personal de la carrera.",
  },
];

const faqs = [
  {
    question: "¿Qué es Calificaciones UP?",
    answer:
      "Calificaciones UP es una plataforma académica para estudiantes de la Universidad de Panamá que organiza información relacionada con la Secretaría Virtual, incluyendo calificaciones, avance académico, materias pendientes, profesores y estado de cuenta.",
  },
  {
    question: "¿Sirve para consultar calificaciones de la Universidad de Panamá?",
    answer:
      "Sí. Su objetivo es facilitar la consulta de calificaciones y notas mediante vistas más legibles, filtros y resúmenes que ayudan a interpretar el expediente académico.",
  },
  {
    question: "¿Qué información puedo visualizar dentro de la plataforma?",
    answer:
      "Puedes revisar dashboard general, plan académico, pendientes, analytics, recovery, profesores, morosidad y perfil.",
  },
  {
    question: "¿Esta plataforma reemplaza la Secretaría Virtual?",
    answer:
      "No. Calificaciones UP funciona como una capa de consulta y visualización más clara. No cambia endpoints ni contratos del sistema original.",
  },
  {
    question: "¿Para quién está pensada esta plataforma?",
    answer:
      "Está pensada para estudiantes que necesitan entender rápido sus notas, materias pendientes, progreso en la carrera y datos del expediente académico.",
  },
];

const heroMetrics = [
  ["Avance", "78.4%", "Créditos aprobados"],
  ["Pendientes", "12", "Materias por resolver"],
  ["Profesores", "36", "Asignaciones visibles"],
  ["Estado", "Paz y salvo", "Morosidad actual"],
];

const benefits = [
  "Detecta rápido qué materias frenan el avance académico.",
  "Reduce tiempo buscando datos en vistas fragmentadas o poco claras.",
  "Facilita leer notas, intentos, periodos y estados dentro del mismo flujo.",
  "Ayuda a priorizar pendientes, recovery y revisión de profesores.",
  "Entrega una vista profesional del expediente académico.",
  "Hace más sencilla la consulta recurrente durante el semestre.",
];

const quickLinks = [
  ["/login", "Iniciar sesión en Calificaciones UP"],
  ["/dashboard", "Abrir dashboard académico"],
  ["/plan", "Ver plan y expediente académico"],
  ["/analytics", "Explorar analytics académico"],
  ["/pendientes", "Revisar materias pendientes"],
  ["/profesores", "Consultar profesores"],
  ["/morosidad", "Ver estado de morosidad"],
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

const organizationStructuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  url: siteConfig.siteUrl,
  description: siteConfig.description,
};

const applicationStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: siteConfig.name,
  url: siteConfig.siteUrl,
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web",
  inLanguage: "es",
  description:
    "Aplicación web para consultar calificaciones, notas, avance académico, materias pendientes, profesores y datos del expediente académico de estudiantes de la Universidad de Panamá.",
  audience: {
    "@type": "EducationalAudience",
    educationalRole: "student",
  },
};

export const metadata: Metadata = {
  title: "Calificaciones UP | Calificaciones Universidad de Panamá y Secretaría Virtual",
  description:
    "Consulta calificaciones UP, notas, avance académico, profesores y expediente académico de la Universidad de Panamá en una plataforma clara relacionada con la Secretaría Virtual.",
  keywords: [
    "calificaciones up",
    "calificaciones universidad de panama",
    "secretaria virtual universidad de panama",
    "notas universidad de panama",
    "avance academico universidad de panama",
    "estudiantes universidad de panama",
    "plataforma academica universidad de panama",
    "expediente academico universidad de panama",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Calificaciones UP | Calificaciones Universidad de Panamá y Secretaría Virtual",
    description:
      "Plataforma académica para visualizar notas, expediente académico, avance, profesores y pendientes de la Universidad de Panamá.",
    url: getCanonicalUrl("/"),
  },
  twitter: {
    title: "Calificaciones UP | Calificaciones Universidad de Panamá y Secretaría Virtual",
    description:
      "Consulta notas, avance académico, profesores y expediente académico de la Universidad de Panamá en una interfaz clara.",
  },
};

const sectionClass = "landing-section mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16";
const eyebrowClass = "landing-eyebrow";
const titleClass = "mt-3 text-3xl font-black tracking-tight text-[var(--foreground)] sm:text-4xl";
const paragraphClass = "mt-4 text-base leading-8 text-[var(--foreground-soft)]";
const softCardClass = "landing-card group rounded-[1.6rem] p-6";
const primaryButtonClass = "landing-button landing-button-primary";
const secondaryButtonClass = "landing-button landing-button-secondary";

export default function HomePage() {
  return (
    <main id="contenido" className="relative isolate min-h-screen overflow-hidden text-[var(--foreground)]">
      <a href="#contenido" className="skip-link">
        Saltar al contenido principal
      </a>

      <AnimatedBackground count={16} />

      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface-elevated)]/80 backdrop-blur-2xl">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <Link href="/" aria-label="Ir al inicio de Calificaciones UP" className="landing-brand">
            <span className="landing-brand-mark">UP</span>
            <span>Calificaciones</span>
          </Link>

          <nav aria-label="Navegación principal" className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[var(--foreground-soft)]">
            {[
              ["#que-es", "Qué es"],
              ["#funciones", "Funciones"],
              ["#modulos", "Módulos"],
              ["#faq", "FAQ"],
            ].map(([href, label]) => (
              <Link key={href} href={href} className="landing-nav-link">
                {label}
              </Link>
            ))}
            <Link href="/login" className={primaryButtonClass}>
              Iniciar sesión
            </Link>
          </nav>
        </div>
      </header>

      <section className={`${sectionClass} grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:py-24`}>
        <div className="relative animate-fade-in-up">
          <div className="absolute -left-10 -top-10 -z-10 h-40 w-40 rounded-full bg-[var(--accent-glow)] blur-3xl" />
          <p className={eyebrowClass}>Plataforma académica para estudiantes</p>

          <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-tight text-[var(--foreground)] sm:text-5xl lg:text-6xl">
            Consulta tus notas, avance académico y datos de la Secretaría Virtual con más claridad
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--foreground-soft)]">
            Calificaciones UP organiza la información académica de la Universidad de Panamá en una experiencia más clara, rápida y fácil de entender.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/login" className={primaryButtonClass}>
              Iniciar sesión
            </Link>
            <Link href="#funciones" className={secondaryButtonClass}>
              Explorar funciones
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              ["Notas claras", "Materias, estados y calificaciones en una lectura rápida."],
              ["Avance visible", "Progreso, créditos y bloqueos académicos en contexto."],
              ["Vista integral", "Plan, analytics, recovery y profesores en un solo lugar."],
            ].map(([title, description]) => (
              <article key={title} className={softCardClass}>
                <div className="mb-4 h-2 w-12 rounded-full bg-[var(--accent)]" />
                <h2 className="text-sm font-bold text-[var(--foreground)]">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--foreground-soft)]">{description}</p>
              </article>
            ))}
          </div>
        </div>

        <aside aria-label="Vista previa del dashboard académico" className="dashboard-preview relative overflow-hidden rounded-[2rem] p-5 text-slate-50 animate-fade-in-up delay-100">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.46),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.28),_transparent_35%)]" />
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-200">Preview</p>
            <h2 className="mt-3 text-2xl font-black">Dashboard académico</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-300">
              Una lectura ejecutiva del expediente: progreso, materias aprobadas, pendientes, profesores y estado financiero.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {heroMetrics.map(([label, value, helper]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 shadow-lg shadow-black/10 backdrop-blur-xl">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-300">{label}</p>
                  <p className="mt-3 text-3xl font-black text-white">{value}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{helper}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-slate-900/70 p-4">
              <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-[0.16em]">
                <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-emerald-200">Aprobadas</span>
                <span className="rounded-full bg-amber-400/15 px-3 py-1 text-amber-200">Pendientes</span>
                <span className="rounded-full bg-rose-400/15 px-3 py-1 text-rose-200">Bloqueos</span>
                <span className="rounded-full bg-sky-400/15 px-3 py-1 text-sky-200">Analytics</span>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <section id="que-es" className={`${sectionClass} animate-fade-in-up delay-200`}>
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="rounded-[1.9rem]">
            <CardHeader>
              <p className={eyebrowClass}>Qué es Calificaciones UP</p>
              <CardTitle className="text-3xl font-black leading-tight text-[var(--foreground)]">
                Una forma más clara de consultar calificaciones de la Universidad de Panamá
              </CardTitle>
              <CardDescription className="text-base leading-7 text-[var(--foreground-soft)]">
                La plataforma está pensada para estudiantes que necesitan entender rápido su información académica sin perder tiempo navegando interfaces poco legibles.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-base leading-7 text-[var(--foreground-soft)]">
              <p>
                Calificaciones UP centraliza en una sola experiencia visual lo que normalmente se consulta de forma fragmentada: notas, progreso, bloqueos, historiales y relaciones entre materias.
              </p>
              <p>
                La idea es que el estudiante entienda qué ya aprobó, qué le falta, qué lo está frenando y dónde conviene profundizar.
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Para quién es", "Para estudiantes que consultan expediente, notas, avance académico, profesores o estado de cuenta."],
              ["Qué permite visualizar", "Dashboard, plan académico, pendientes, recovery, analytics, profesores, morosidad y perfil."],
              ["Ventaja principal", "Mejor lectura del expediente con filtros, resúmenes y jerarquía visual útil."],
              ["Relación con Secretaría Virtual", "Presenta información académica relacionada sin cambiar la lógica ni los contratos de la API."],
            ].map(([title, description]) => (
              <article key={title} className={softCardClass}>
                <h3 className="text-lg font-black text-[var(--foreground)]">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--foreground-soft)]">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="funciones" className={`${sectionClass} animate-fade-in-up delay-300`}>
        <div className="max-w-3xl">
          <p className={eyebrowClass}>Qué puedes consultar</p>
          <h2 className={titleClass}>Desde notas hasta avance académico y profesores</h2>
          <p className={paragraphClass}>
            El home explica con claridad qué puedes hacer cuando entras a la plataforma y por qué resulta más útil que una consulta académica dispersa.
          </p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {[
            ["Consultar calificaciones y estados", "Revisa materias aprobadas, pendientes, reprobadas u observadas con filtros claros."],
            ["Entender el avance académico", "Visualiza progreso porcentual, créditos aprobados, créditos pendientes y materias que bloquean pasos futuros."],
            ["Explorar el expediente completo", "Cruza año, semestre, plan, nota y estatus para interpretar el expediente con más contexto."],
            ["Analizar tendencias", "Usa analytics para detectar distribuciones de notas, rangos de desempeño y patrones académicos."],
            ["Ver profesores y periodos", "Consulta asignación docente por materia y periodo sin perder el contexto del plan académico."],
            ["Revisar morosidad y recovery", "Completa la lectura del estudiante con estado de cuenta, intentos múltiples, suficiencias y verano."],
          ].map(([title, body]) => (
            <article key={title} className={softCardClass}>
              <h3 className="text-xl font-black text-[var(--foreground)]">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--foreground-soft)]">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={`${sectionClass} animate-fade-in-up delay-400`}>
        <div className="landing-panel rounded-[2rem] px-6 py-8 lg:px-8">
          <div className="max-w-3xl">
            <p className={eyebrowClass}>Beneficios para estudiantes</p>
            <h2 className={titleClass}>Menos fricción para entender decisiones académicas importantes</h2>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {benefits.map((item) => (
              <div key={item} className="landing-benefit">
                <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-[var(--accent)] shadow-[0_0_0_6px_var(--accent-soft)]" />
                <p className="text-sm leading-7 text-[var(--foreground-soft)]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="modulos" className={`${sectionClass} animate-fade-in-up delay-500`}>
        <div className="max-w-3xl">
          <p className={eyebrowClass}>Módulos principales</p>
          <h2 className={titleClass}>Dashboard, plan, analytics y otras vistas clave</h2>
          <p className={paragraphClass}>
            Cada módulo tiene un objetivo concreto. En conjunto, forman una plataforma orientada a consulta real y no a una landing vacía.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {moduleCards.map((module) => (
            <Link key={module.name} href={module.href} className={softCardClass}>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--accent)]">
                <span className="sr-only">Ir a </span>
                {module.name}
              </p>
              <h3 className="mt-3 text-xl font-black text-[var(--foreground)] group-hover:text-[var(--accent)]">{module.name}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--foreground-soft)]">{module.description}</p>
              <p className="mt-5 text-sm font-black text-[var(--accent)]">Explorar {module.name.toLowerCase()}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className={sectionClass}>
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="flow-card rounded-[2rem] p-8 text-slate-50">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-200">Cómo consultar calificaciones</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">Un flujo simple para entender mejor la información académica</h2>

            <div className="mt-8 space-y-6 text-sm leading-7 text-slate-300">
              {[
                ["1. Entra al dashboard", "Empieza por una vista ejecutiva del estudiante para ver progreso, materias críticas y relación con estado financiero."],
                ["2. Baja al plan académico", "Usa filtros y ordenamiento para encontrar materias, revisar notas y detectar estados pendientes o reprobados."],
                ["3. Abre analytics y profesores", "Cruza distribuciones de notas, periodos y asignaciones docentes para tener una lectura más completa."],
              ].map(([title, body]) => (
                <div key={title}>
                  <h3 className="text-lg font-black text-white">{title}</h3>
                  <p className="mt-2">{body}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="landing-panel rounded-[2rem] p-8">
            <p className={eyebrowClass}>Enlaces útiles</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-[var(--foreground)]">Accesos directos crawlables</h2>
            <p className="mt-4 text-sm leading-7 text-[var(--foreground-soft)]">Estas rutas ayudan tanto al usuario como al descubrimiento interno del sitio.</p>
            <div className="mt-6 grid gap-3">
              {quickLinks.map(([href, label]) => (
                <Link key={href} href={href} className="landing-list-link">
                  {label}
                </Link>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section id="faq" className={sectionClass}>
        <div className="max-w-3xl">
          <p className={eyebrowClass}>Preguntas frecuentes</p>
          <h2 className={titleClass}>FAQ sobre Calificaciones UP y Secretaría Virtual</h2>
        </div>
        <div className="mt-8 grid gap-4">
          {faqs.map((faq) => (
            <article key={faq.question} className={softCardClass}>
              <h3 className="text-xl font-black text-[var(--foreground)]">{faq.question}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--foreground-soft)]">{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8 lg:pb-24">
        <div className="cta-card relative overflow-hidden rounded-[2.2rem] px-8 py-10 text-white lg:flex lg:items-end lg:justify-between">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-sky-400/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="relative max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-200">CTA final</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Entiende tu información académica sin perder tiempo</h2>
            <p className="mt-4 text-base leading-8 text-blue-100">Consulta notas, avance, pendientes, profesores y datos académicos desde una interfaz más clara y profesional.</p>
          </div>
          <div className="relative mt-6 flex flex-col gap-3 sm:flex-row lg:mt-0">
            <Link href="/login" className="landing-button bg-white text-blue-950 hover:bg-blue-50">
              Iniciar sesión
            </Link>
            <Link href="/plan" className="landing-button border border-white/30 text-white hover:bg-white/10">
              Ver plan académico
            </Link>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationStructuredData) }}
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
