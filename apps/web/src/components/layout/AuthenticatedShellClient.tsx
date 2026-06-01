"use client";

import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

import { AuthenticatedShellSkeleton } from "@/components/layout/AuthenticatedShellSkeleton";
import { Button } from "@/components/ui/button";
import { useLogoutMutation, useSessionQuery } from "@/features/auth/queries";
import { StudentPhoto } from "@/features/student/components/StudentPhoto";
import { useStudentData } from "@/features/student/context/StudentDataContext";
import { getEnv } from "@/lib/env";
import { cn } from "@/lib/utils";

type AuthenticatedShellClientProps = {
  children: React.ReactNode;
};

type NavItem = {
  href: string;
  label: string;
  description: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", description: "Resumen general" },
  { href: "/plan", label: "Plan de estudios", description: "Historial y ordenamiento" },
  { href: "/pendientes", label: "Pendientes", description: "Materias por resolver" },
  { href: "/analytics", label: "Analytics", description: "Distribuciones y progreso" },
  { href: "/recovery", label: "Recovery", description: "Intentos y recuperación" },
  { href: "/profesores", label: "Profesores", description: "Asignaciones docentes" },
  { href: "/morosidad", label: "Morosidad", description: "Estado financiero" },
  { href: "/perfil", label: "Perfil", description: "Ficha del estudiante" },
];

const PAGE_META: Record<string, { title: string; description: string }> = {
  "/dashboard": {
    title: "Dashboard académico",
    description: "Resumen del expediente, alertas y métricas de avance.",
  },
  "/plan": {
    title: "Plan de estudios",
    description: "Vista completa del historial académico con filtros y ordenamiento.",
  },
  "/pendientes": {
    title: "Pendientes y bloqueos",
    description: "Materias no resueltas y su impacto en el avance.",
  },
  "/analytics": {
    title: "Analytics académico",
    description: "Distribuciones y cortes útiles derivados del expediente real.",
  },
  "/recovery": {
    title: "Recovery e intentos",
    description: "Seguimiento de materias repetidas y procesos de recuperación.",
  },
  "/profesores": {
    title: "Profesores",
    description: "Asignación docente por materia y período académico.",
  },
  "/morosidad": {
    title: "Morosidad",
    description: "Estado financiero y registros vinculados al estudiante.",
  },
  "/perfil": {
    title: "Perfil del estudiante",
    description: "Datos generales, progreso y resumen del expediente.",
  },
};

function normalizeText(value: unknown, fallback = "-"): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const normalized = value.trim();
  return normalized || fallback;
}

function financialStatusLabel(status: unknown): string {
  const normalized = normalizeText(status, "desconocido").toLowerCase();
  if (normalized === "paz_y_salvo") {
    return "Paz y salvo";
  }
  if (normalized === "moroso") {
    return "Moroso";
  }
  return "Sin dato";
}

function financialStatusVariant(status: unknown): string {
  const normalized = normalizeText(status, "desconocido").toLowerCase();
  if (normalized === "paz_y_salvo") {
    return "status-success";
  }
  if (normalized === "moroso") {
    return "status-danger";
  }
  return "status-neutral";
}

function ShellNavigation({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-1" aria-label="Navegación principal">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href;
        return (
          <NavLink
            key={item.href}
            to={item.href}
            aria-current={active ? "page" : undefined}
            onClick={onNavigate}
            className={cn(
              "rounded-lg border px-3 py-3 text-sm transition-colors",
              active
                ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                : "border-transparent text-[var(--foreground-soft)] hover:border-[var(--border)] hover:bg-[var(--card-muted)] hover:text-[var(--foreground)]",
            )}
          >
            <span className="block font-semibold">{item.label}</span>
            <span className="mt-1 block text-xs text-[var(--foreground-muted)]">{item.description}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

export function AuthenticatedShellClient({ children }: AuthenticatedShellClientProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const { state, student, morosidad } = useStudentData();
  const env = getEnv();
  const sessionQuery = useSessionQuery();
  const logoutMutation = useLogoutMutation();

  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("up-theme");
      if (saved === "dark") {
        setTheme("dark");
      }
    } catch {
      setTheme("light");
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const isDark = theme === "dark";
    root.classList.toggle("theme-dark", isDark);
    try {
      window.localStorage.setItem("up-theme", theme);
    } catch {
      // ignore storage failures
    }
  }, [theme]);

  useEffect(() => {
    if (sessionQuery.data?.authenticated) {
      try {
        window.sessionStorage.removeItem("up-optimistic-session");
      } catch {
        // ignore storage failures
      }
    }
  }, [sessionQuery.data?.authenticated]);

  useEffect(() => {
    if (sessionQuery.isPending) {
      return;
    }

    if (!sessionQuery.data?.authenticated) {
      navigate("/login", { replace: true });
    }
  }, [navigate, sessionQuery.data?.authenticated, sessionQuery.isPending]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const studentName = normalizeText(student.name, "Estudiante");
  const studentCareer = normalizeText(student.career);
  const studentPlan = normalizeText(student.plan);
  const studentIndex = normalizeText(student.currentIndex);
  const pageMeta = PAGE_META[pathname] ?? {
    title: env.appName,
    description: "Consulta del expediente académico.",
  };

  const shellStatus = useMemo(() => {
    if (state.status === "loading") return "Cargando expediente";
    if (state.status === "error") return "Error de carga";
    if (state.status === "empty") return "Sin materias registradas";
    return "Expediente actualizado";
  }, [state.status]);

  async function handleLogout() {
    setError(null);
    try {
      await logoutMutation.mutateAsync();
      navigate("/", { replace: true });
    } catch {
      setError("No fue posible cerrar sesión.");
    }
  }

  if (sessionQuery.isPending || !sessionQuery.data?.authenticated) {
    return <AuthenticatedShellSkeleton />;
  }

  return (
    <main className="min-h-screen bg-[var(--background)]" role="main">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col gap-4 p-4 lg:flex-row lg:gap-6 lg:p-6">
        <aside className="shell-sidebar hidden w-[292px] shrink-0 rounded-xl p-5 lg:block lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">
          <div className="flex items-center gap-3">
            <StudentPhoto name={studentName} size={56} roundedClassName="rounded-lg" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-[var(--foreground-muted)]">Universidad de Panamá</p>
              <h2 className="truncate text-base font-semibold text-primary">{studentName}</h2>
              <p className="truncate text-sm text-foreground-soft">{studentCareer}</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="surface-elevated rounded-lg p-3">
              <p className="text-xs text-foreground-muted">Plan</p>
              <p className="mt-1 text-sm font-semibold text-primary">{studentPlan}</p>
            </div>
            <div className="surface-elevated rounded-lg p-3">
              <p className="text-xs text-foreground-muted">Índice</p>
              <p className="mt-1 text-sm font-semibold text-primary">{studentIndex}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-medium", financialStatusVariant(morosidad?.status))}>
              {financialStatusLabel(morosidad?.status)}
            </span>
            <span className="inline-flex rounded-full border border-[var(--border)] bg-[var(--card-muted)] px-3 py-1 text-xs font-medium text-[var(--foreground-soft)]">
              {shellStatus}
            </span>
          </div>

          <div className="mt-6">
            <ShellNavigation pathname={pathname} />
          </div>

          <div className="mt-6 grid gap-2 border-t border-[var(--border)] pt-4">
            <Button type="button" variant="outline" onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}>
              {theme === "dark" ? "Modo claro" : "Modo oscuro"}
            </Button>
            <button
              type="button"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="inline-flex min-h-10 items-center justify-center rounded-md border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--danger)] hover:bg-[var(--danger-soft)] disabled:opacity-50"
            >
              {logoutMutation.isPending ? "Cerrando sesión..." : "Cerrar sesión"}
            </button>
          </div>
        </aside>

        <section className="shell-main min-w-0 flex-1 rounded-xl p-4 sm:p-5 lg:p-7">
          <header className="border-b border-[var(--border)] pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="section-kicker">{env.appName}</p>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
                  {pageMeta.title}
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-foreground-soft">
                  {pageMeta.description}
                </p>
              </div>

              <div className="flex items-center gap-2 lg:hidden">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(true)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--card)]"
                  aria-label="Abrir navegación"
                >
                  <span className="block h-0.5 w-4 bg-current" />
                  <span className="sr-only">Abrir menú</span>
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-medium", financialStatusVariant(morosidad?.status))}>
                {financialStatusLabel(morosidad?.status)}
              </span>
              <span className="inline-flex rounded-full border border-[var(--border)] bg-[var(--card-muted)] px-3 py-1 text-xs font-medium text-[var(--foreground-soft)]">
                {shellStatus}
              </span>
            </div>
          </header>

          {error ? (
            <div role="alert" className="status-danger mt-4 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          ) : null}

          <div className="mt-6 min-w-0">{children}</div>
        </section>
      </div>

      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navegación">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Cerrar navegación"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[min(88vw,320px)] bg-[var(--sidebar)] p-4 shadow-xl">
            <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
              <div className="min-w-0">
                <p className="text-xs text-foreground-muted">Estudiante</p>
                <p className="truncate text-base font-semibold text-primary">{studentName}</p>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border)]"
                aria-label="Cerrar menú"
              >
                ×
              </button>
            </div>

            <div className="mt-4">
              <ShellNavigation pathname={pathname} onNavigate={() => setMobileMenuOpen(false)} />
            </div>

            <div className="mt-4 grid gap-2 border-t border-[var(--border)] pt-4">
              <Button type="button" variant="outline" onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}>
                {theme === "dark" ? "Modo claro" : "Modo oscuro"}
              </Button>
              <button
                type="button"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="inline-flex min-h-10 items-center justify-center rounded-md border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--danger)] hover:bg-[var(--danger-soft)] disabled:opacity-50"
              >
                {logoutMutation.isPending ? "Cerrando sesión..." : "Cerrar sesión"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
