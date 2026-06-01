import { Link } from "react-router-dom";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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

export function HomePage() {
  return (
    <main id="contenido" className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <a href="#contenido" className="skip-link">
        Saltar al contenido principal
      </a>

      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--card)] backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <Link to="/" aria-label="Ir al inicio de Calificaciones UP" className="landing-brand min-w-0">
            <span className="landing-brand-mark">UP</span>
            <span className="truncate">Calificaciones UP</span>
          </Link>

          <nav aria-label="Navegación principal" className="flex min-w-0 flex-wrap items-center gap-2 text-sm">
            <a href="#plataforma" className="landing-nav-link">
              Plataforma
            </a>
            <a href="#modulos" className="landing-nav-link">
              Módulos
            </a>
            <a href="#preguntas" className="landing-nav-link">
              Preguntas
            </a>
            <Link to="/login" className="landing-button landing-button-primary">
              Iniciar sesión
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:px-8 lg:py-20">
        <div className="self-center">
          <p className="landing-eyebrow">Consulta académica para estudiantes</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-primary break-words sm:text-5xl">
            Una vista más clara del expediente académico de la Universidad de Panamá
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-foreground-soft sm:text-lg">
            Calificaciones UP organiza notas, avance, pendientes, recovery, profesores y morosidad en una interfaz sobria, responsive y pensada para revisar información real con menos fricción.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/login" className="landing-button landing-button-primary">
              Entrar a la plataforma
            </Link>
            <a href="#modulos" className="landing-button landing-button-secondary">
              Ver módulos
            </a>
          </div>

          <dl className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="surface-panel rounded-xl p-4">
              <dt className="text-sm text-foreground-muted">Módulos disponibles</dt>
              <dd className="mt-2 text-xl font-semibold text-primary break-words sm:text-2xl">{moduleCards.length}</dd>
            </div>
            <div className="surface-panel rounded-xl p-4">
              <dt className="text-sm text-foreground-muted">Consulta académica</dt>
              <dd className="mt-2 text-xl font-semibold text-primary break-words sm:text-2xl">Notas, plan y avance</dd>
            </div>
            <div className="surface-panel rounded-xl p-4">
              <dt className="text-sm text-foreground-muted">Acceso</dt>
              <dd className="mt-2 text-xl font-semibold text-primary break-words sm:text-2xl">Credenciales existentes</dd>
            </div>
          </dl>
        </div>

        <aside aria-label="Vista previa de la plataforma" className="dashboard-preview min-w-0 rounded-xl p-5 text-slate-50">
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="flex min-w-0 flex-col gap-3 border-b border-white/10 pb-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.08em] text-slate-300">Panel académico</p>
                <p className="mt-1 text-lg font-semibold text-white">Resumen del estudiante</p>
              </div>
              <span className="inline-flex max-w-full rounded-md border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
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
          {moduleCards.map((module) => (
            <Card key={module.name} className="surface-panel rounded-xl border border-[var(--border)]">
              <CardHeader>
                <CardTitle className="text-primary">{module.name}</CardTitle>
                <CardDescription className="text-foreground-soft">{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to={module.href} className="landing-button landing-button-secondary inline-flex">
                  Abrir módulo
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="preguntas" className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
        <div className="flex flex-col gap-3">
          <p className="landing-eyebrow">Preguntas frecuentes</p>
          <h2 className="text-3xl font-semibold tracking-tight text-primary">Lo esencial antes de entrar</h2>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {faqs.map((faq) => (
            <article key={faq.question} className="surface-panel rounded-xl p-6">
              <h3 className="text-lg font-semibold text-primary">{faq.question}</h3>
              <p className="mt-3 text-sm leading-7 text-foreground-soft">{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
