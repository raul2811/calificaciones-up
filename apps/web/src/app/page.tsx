import type { Metadata } from "next";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCanonicalUrl, siteConfig } from "@/lib/site";

const moduleCards = [
  {
    name: "Dashboard",
    href: "/dashboard",
    description:
      "Resume el estado academico y financiero con indicadores, progreso, materias criticas y accesos rapidos para entender el panorama general sin navegar pantallas dispersas.",
  },
  {
    name: "Plan",
    href: "/plan",
    description:
      "Ordena y filtra el expediente academico de la Universidad de Panama para revisar materias aprobadas, pendientes, observadas o reprobadas en una sola tabla.",
  },
  {
    name: "Pendientes",
    href: "/pendientes",
    description:
      "Detecta bloqueos, materias por resolver y puntos que afectan el avance academico de la Universidad de Panama.",
  },
  {
    name: "Analytics",
    href: "/analytics",
    description:
      "Visualiza notas de la Universidad de Panama con graficas, rangos de calificacion y cruces por ano, semestre y estado.",
  },
  {
    name: "Recovery",
    href: "/recovery",
    description:
      "Da seguimiento a recuperaciones, suficiencias, veranos y multiples intentos para entender mejor el historial del expediente academico.",
  },
  {
    name: "Profesores",
    href: "/profesores",
    description:
      "Consulta asignaciones docentes por materia y periodo para revisar profesores relacionados con tu carga academica.",
  },
  {
    name: "Morosidad",
    href: "/morosidad",
    description:
      "Muestra el estado de cuenta, paz y salvo y registros financieros vinculados con la experiencia academica del estudiante.",
  },
  {
    name: "Perfil",
    href: "/perfil",
    description:
      "Presenta datos clave del estudiante, avance porcentual y resumen personal para ubicar rapido el estado actual de la carrera.",
  },
];

const faqs = [
  {
    question: "Que es Calificaciones UP?",
    answer:
      "Calificaciones UP es una plataforma academica para estudiantes de la Universidad de Panama que organiza de forma clara informacion relacionada con la Secretaria Virtual, incluyendo calificaciones, avance academico, materias pendientes, profesores y estado de cuenta.",
  },
  {
    question: "Sirve para consultar calificaciones de la Universidad de Panama?",
    answer:
      "Si. El objetivo principal es facilitar la consulta de calificaciones universidad de panama y notas universidad de panama mediante vistas mas legibles, filtros y resumenes que ayudan a interpretar el expediente academico.",
  },
  {
    question: "Que informacion puedo visualizar dentro de la plataforma?",
    answer:
      "Puedes revisar dashboard general, plan academico, pendientes, analytics, recovery, profesores, morosidad y perfil. Eso permite entender mejor el avance academico universidad de panama y el contexto completo del expediente.",
  },
  {
    question: "Esta plataforma reemplaza la Secretaria Virtual Universidad de Panama?",
    answer:
      "No. Calificaciones UP se presenta como una capa de consulta y visualizacion mas clara para informacion academica relacionada con la Secretaria Virtual Universidad de Panama. No cambia endpoints ni contratos del sistema original.",
  },
  {
    question: "Para quien esta pensada esta plataforma academica Universidad de Panama?",
    answer:
      "Esta pensada para estudiantes universidad de panama que necesitan entender rapido sus notas, materias pendientes, progreso en la carrera y datos del expediente academico sin depender de interfaces mas rigidas o menos claras.",
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
    "Aplicacion web para consultar calificaciones, notas, avance academico, materias pendientes, profesores y datos del expediente academico de estudiantes de la Universidad de Panama.",
  audience: {
    "@type": "EducationalAudience",
    educationalRole: "student",
  },
};

export const metadata: Metadata = {
  title: "Calificaciones UP | Calificaciones Universidad de Panama y Secretaria Virtual",
  description:
    "Consulta calificaciones UP, notas, avance academico, profesores y expediente academico de la Universidad de Panama en una plataforma clara relacionada con la Secretaria Virtual.",
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
    title: "Calificaciones UP | Calificaciones Universidad de Panama y Secretaria Virtual",
    description:
      "Plataforma academica para visualizar notas, expediente academico, avance, profesores y pendientes de la Universidad de Panama.",
    url: getCanonicalUrl("/"),
  },
  twitter: {
    title: "Calificaciones UP | Calificaciones Universidad de Panama y Secretaria Virtual",
    description:
      "Consulta notas, avance academico, profesores y expediente academico de la Universidad de Panama en una interfaz clara.",
  },
};

export default function HomePage() {
  return (
    <main className="min-h-screen text-slate-900">
      <section className="border-b border-slate-200/80">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-6 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/" className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-900">
            Calificaciones UP
          </Link>
          <nav aria-label="Navegacion principal" className="flex flex-wrap items-center gap-4 text-sm text-slate-700">
            <Link href="#que-es" className="hover:text-blue-800">Que es</Link>
            <Link href="#funciones" className="hover:text-blue-800">Funciones</Link>
            <Link href="#modulos" className="hover:text-blue-800">Modulos</Link>
            <Link href="#faq" className="hover:text-blue-800">FAQ</Link>
            <Link
              href="/login"
              className="inline-flex items-center rounded-full bg-blue-900 px-4 py-2 font-semibold text-white transition hover:bg-blue-800"
            >
              Iniciar sesion
            </Link>
          </nav>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-24">
        <div>
          <p className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-blue-800">
            Plataforma academica para estudiantes de la Universidad de Panama
          </p>
          <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Calificaciones UP para consultar notas, avance academico y datos de la Secretaria Virtual Universidad de Panama con mas claridad
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-700">
            Calificaciones UP es una plataforma para consultar y visualizar informacion academica relacionada con la Secretaria Virtual Universidad de Panama. Reune en una experiencia mas clara las calificaciones universidad de panama, el expediente academico universidad de panama, los pendientes, profesores y el avance real del estudiante.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full bg-blue-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              Iniciar sesion
            </Link>
            <Link
              href="#funciones"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:border-blue-300 hover:text-blue-800"
            >
              Explorar funciones
            </Link>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              ["Notas mas claras", "Lectura rapida de materias, estados y calificaciones."],
              ["Avance visible", "Resumen ejecutivo para entender progreso y bloqueos."],
              ["Consulta integral", "Plan, analytics, recovery y profesores en un solo lugar."],
            ].map(([title, description]) => (
              <article key={title} className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
              </article>
            ))}
          </div>
        </div>

        <aside
          aria-label="Vista previa del dashboard academico"
          className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 p-5 text-slate-50 shadow-2xl shadow-slate-300/60"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.32),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.25),_transparent_35%)]" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-200">Preview</p>
            <h2 className="mt-3 text-2xl font-semibold">Dashboard de calificaciones UP</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-300">
              Una lectura rapida del expediente academico universidad de panama: progreso, materias aprobadas, pendientes, profesores y estado financiero en una sola pantalla.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                ["Avance academico", "78.4%", "Creditos aprobados frente al total del plan."],
                ["Materias pendientes", "12", "Pendientes, reprobadas y en observacion."],
                ["Profesores visibles", "36", "Asignacion docente organizada por materia."],
                ["Estado de cuenta", "Paz y salvo", "Consulta de morosidad y registros financieros."],
              ].map(([label, value, helper]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-300">{label}</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{helper}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-2xl border border-white/10 bg-slate-900/70 p-4">
              <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-emerald-200">Aprobadas</span>
                <span className="rounded-full bg-amber-400/15 px-3 py-1 text-amber-200">Pendientes</span>
                <span className="rounded-full bg-rose-400/15 px-3 py-1 text-rose-200">Bloqueos</span>
                <span className="rounded-full bg-sky-400/15 px-3 py-1 text-sky-200">Analytics</span>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <section id="que-es" className="mx-auto w-full max-w-7xl px-6 py-10 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="rounded-[1.75rem] border-slate-200/90 bg-white/90 shadow-lg shadow-slate-200/60">
            <CardHeader>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-800">Que es Calificaciones UP</p>
              <CardTitle className="text-3xl leading-tight text-slate-950">
                Una forma mas clara de consultar calificaciones universidad de panama
              </CardTitle>
              <CardDescription className="text-base leading-7 text-slate-600">
                La plataforma esta pensada para estudiantes que necesitan entender rapido su informacion academica sin perder tiempo navegando interfaces viejas o poco legibles.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-base leading-7 text-slate-700">
              <p>
                Calificaciones UP centraliza en una sola experiencia visual lo que normalmente se consulta de forma fragmentada. En lugar de buscar solo notas universidad de panama aisladas, puedes revisar contexto, progreso, bloqueos, historiales y relaciones entre materias.
              </p>
              <p>
                Eso convierte la plataforma academica universidad de panama en una herramienta de lectura y analisis, no solo en un listado de datos. La idea es que el estudiante entienda que ya aprobo, que le falta, que lo esta frenando y donde conviene profundizar.
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              [
                "Para quien es",
                "Para estudiantes universidad de panama que consultan expediente, notas, avance academico, profesores o estado de cuenta.",
              ],
              [
                "Que permite visualizar",
                "Dashboard, plan academico, pendientes, recovery, analytics, profesores, morosidad y perfil del estudiante.",
              ],
              [
                "Ventaja principal",
                "Mejor lectura del expediente academico universidad de panama con filtros, resumenes y jerarquia visual mas util.",
              ],
              [
                "Relacion con Secretaria Virtual",
                "Presenta informacion academica relacionada con la secretaria virtual universidad de panama sin cambiar la logica de la API.",
              ],
            ].map(([title, description]) => (
              <article key={title} className="rounded-[1.5rem] border border-slate-200 bg-white/85 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="funciones" className="mx-auto w-full max-w-7xl px-6 py-10 lg:py-14">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-800">Que puedes consultar</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Desde notas universidad de panama hasta avance academico y profesores
          </h2>
          <p className="mt-4 text-base leading-8 text-slate-700">
            El home no existe para prometer funciones abstractas. Existe para explicar con claridad que puedes hacer cuando entras a la plataforma y por que resulta mas util que una consulta academica dispersa o poco clara.
          </p>
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {[
            {
              title: "Consultar calificaciones y estados",
              body: "Revisa materias aprobadas, pendientes, reprobadas u observadas con filtros que hacen mas simple leer el historial academico.",
            },
            {
              title: "Entender el avance academico universidad de panama",
              body: "Visualiza progreso porcentual, creditos aprobados, creditos pendientes y materias que bloquean pasos futuros.",
            },
            {
              title: "Explorar el expediente completo",
              body: "Cruza ano, semestre, plan, nota y estatus para interpretar el expediente academico universidad de panama con mas contexto.",
            },
            {
              title: "Analizar tendencias",
              body: "Usa analytics para detectar distribuciones de notas, rangos de desempeno y comportamientos academicos relevantes.",
            },
            {
              title: "Ver profesores y periodos",
              body: "Consulta asignacion docente por materia y periodo sin perder de vista el contexto del plan academico.",
            },
            {
              title: "Revisar morosidad y recovery",
              body: "Completa la lectura del estudiante con datos de cuenta, intentos multiples, suficiencias, verano y arreglos.",
            },
          ].map((item) => (
            <article key={item.title} className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-slate-950">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-10 lg:py-14">
        <div className="rounded-[2rem] border border-slate-200 bg-white px-6 py-8 shadow-lg shadow-slate-200/50 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-800">
              Beneficios para estudiantes de la Universidad de Panama
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Menos friccion para entender decisiones academicas importantes
            </h2>
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {[
              "Permite detectar rapido que materias frenan el avance academico universidad de panama.",
              "Reduce tiempo buscando datos en vistas menos claras o demasiado fragmentadas.",
              "Facilita leer notas, intentos, periodos y estados dentro del mismo flujo.",
              "Ayuda a priorizar pendientes, recovery y revision de profesores con mejor contexto.",
              "Entrega una vista mas profesional y comprensible del expediente academico universidad de panama.",
              "Hace mas sencilla la consulta recurrente para estudiantes que revisan su progreso varias veces por semestre.",
            ].map((item) => (
              <div key={item} className="flex gap-4 rounded-[1.5rem] border border-slate-200/80 bg-slate-50 p-5">
                <div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-blue-700" />
                <p className="text-sm leading-7 text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="modulos" className="mx-auto w-full max-w-7xl px-6 py-10 lg:py-14">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-800">Modulos principales</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Dashboard, plan, analytics y otras vistas clave para el estudiante
          </h2>
          <p className="mt-4 text-base leading-8 text-slate-700">
            Cada modulo tiene un objetivo concreto. En conjunto, forman una plataforma academica universidad de panama orientada a consulta real y no a una landing vacia.
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {moduleCards.map((module) => (
            <Link
              key={module.name}
              href={module.href}
              className="group rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-800">
                <span className="sr-only">Ir a </span>
                {module.name}
              </p>
              <h3 className="mt-3 text-xl font-semibold text-slate-950 group-hover:text-blue-900">
                {module.name}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{module.description}</p>
              <p className="mt-5 text-sm font-semibold text-blue-800">
                Explorar {module.name.toLowerCase()}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-10 lg:py-14">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-slate-50 shadow-2xl shadow-slate-300/40">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-200">
              Como consultar calificaciones, avance academico y profesores
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              Un flujo simple para entender mejor la informacion academica
            </h2>
            <div className="mt-8 space-y-6 text-sm leading-7 text-slate-300">
              <div>
                <h3 className="text-lg font-semibold text-white">1. Entra al dashboard</h3>
                <p className="mt-2">
                  Empieza por una vista ejecutiva del estudiante para ver progreso, materias criticas y relacion entre expediente y estado financiero.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">2. Baja al plan academico</h3>
                <p className="mt-2">
                  Usa filtros y ordenamiento para encontrar materias, revisar notas universidad de panama y detectar estados pendientes o reprobados.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">3. Abre analytics y profesores</h3>
                <p className="mt-2">
                  Cruza distribuciones de notas, periodos y asignaciones docentes para tener una lectura mas completa del avance academico universidad de panama.
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/50">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-800">Enlaces utiles</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              Accesos directos crawlables
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Estas rutas ayudan tanto al usuario como al descubrimiento interno del sitio.
            </p>
            <div className="mt-6 grid gap-3">
              {[
                ["/login", "Iniciar sesion en Calificaciones UP"],
                ["/dashboard", "Abrir dashboard academico"],
                ["/plan", "Ver plan y expediente academico"],
                ["/analytics", "Explorar analytics academico"],
                ["/pendientes", "Revisar materias pendientes"],
                ["/profesores", "Consultar profesores"],
                ["/morosidad", "Ver estado de morosidad"],
              ].map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:bg-white hover:text-blue-900"
                >
                  {label}
                </Link>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section id="faq" className="mx-auto w-full max-w-7xl px-6 py-10 lg:py-14">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-800">Preguntas frecuentes</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            FAQ sobre calificaciones UP, expediente academico y Secretaria Virtual
          </h2>
        </div>
        <div className="mt-8 grid gap-4">
          {faqs.map((faq) => (
            <article key={faq.question} className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-slate-950">{faq.question}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 pb-20 pt-10 lg:pb-24">
        <div className="rounded-[2.2rem] border border-blue-200 bg-gradient-to-r from-blue-950 via-blue-900 to-sky-900 px-8 py-10 text-white shadow-2xl shadow-blue-200/40 lg:flex lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-200">CTA final</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Empieza a consultar tu informacion academica con una vista mas clara
            </h2>
            <p className="mt-4 text-base leading-8 text-blue-100">
              Si buscas calificaciones up, notas universidad de panama, avance academico universidad de panama o una mejor lectura del expediente academico, este es el punto de entrada.
            </p>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:mt-0">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-blue-950 transition hover:bg-blue-50"
            >
              Iniciar sesion
            </Link>
            <Link
              href="/plan"
              className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Ver plan academico
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
