"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { getSession, logout } from "@/features/auth/api";
import { StudentPhoto } from "@/features/student/components/StudentPhoto";
import { useStudentData } from "@/features/student/context/StudentDataContext";
import { getEnv } from "@/lib/env";

type AuthenticatedShellClientProps = {
  children: React.ReactNode;
};

type NavItem = {
  href: string;
  label: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/plan", label: "Plan" },
  { href: "/pendientes", label: "Pendientes" },
  { href: "/analytics", label: "Analytics" },
  { href: "/recovery", label: "Recovery" },
  { href: "/profesores", label: "Profesores" },
  { href: "/morosidad", label: "Morosidad" },
  { href: "/perfil", label: "Perfil" },
];

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
  return "Desconocido";
}

function financialStatusClass(status: unknown): string {
  const normalized = normalizeText(status, "desconocido").toLowerCase();
  if (normalized === "paz_y_salvo") {
    return "status-success";
  }
  if (normalized === "moroso") {
    return "status-danger";
  }
  return "status-neutral";
}

export function AuthenticatedShellClient({ children }: AuthenticatedShellClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { state, student, morosidad } = useStudentData();
  const env = getEnv();

  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");

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
      // ignore
    }
  }, [theme]);

  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      try {
        const session = await getSession();

        if (!isMounted) {
          return;
        }

        if (!session.authenticated) {
          router.replace("/login");
          return;
        }

        setIsCheckingSession(false);
      } catch {
        if (!isMounted) {
          return;
        }

        router.replace("/login");
      }
    }

    void checkSession();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const studentName = normalizeText(student.name, "Estudiante");
  const studentCareer = normalizeText(student.career);
  const studentPlan = normalizeText(student.plan);
  const studentIndex = normalizeText(student.currentIndex);

  const shellStatus = useMemo(() => {
    if (state.status === "loading") {
      return "Cargando expediente...";
    }
    if (state.status === "error") {
      return "Error cargando expediente";
    }
    if (state.status === "empty") {
      return "Sin materias registradas";
    }
    return "Expediente actualizado";
  }, [state.status]);

  async function handleLogout() {
    setError(null);
    setIsLoggingOut(true);

    try {
      await logout();
      router.replace("/");
    } catch {
      setError("No fue posible cerrar sesión.");
      setIsLoggingOut(false);
    }
  }

  if (isCheckingSession) {
    return (
      <main className="min-h-screen p-4" role="main">
        <section
          className="surface-hero mx-auto w-full max-w-7xl rounded-2xl p-10"
          aria-label="Verificando sesión"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="flex items-center gap-3">
            <div
              className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent"
              aria-hidden="true"
            />
            <p className="text-sm font-medium text-[var(--foreground-soft)]">Verificando sesión...</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen" role="main">
      <div className="mx-auto grid min-h-screen w-full max-w-[1920px] grid-cols-1 gap-4 p-3 lg:grid-cols-[300px_1fr] lg:p-4">

        {/* ── Sidebar ── */}
        <aside
          className="shell-sidebar rounded-2xl px-5 py-6 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:self-start lg:overflow-y-auto lg:px-5 lg:py-6"
          aria-label="Panel de navegación"
        >

          {/* Student identity */}
          <div className="flex items-center gap-3.5">
            <StudentPhoto name={studentName} size={56} roundedClassName="rounded-xl" />
            <div className="min-w-0 flex-1">
              <p
                className="section-kicker text-[10px] font-semibold uppercase tracking-[0.2em]"
                aria-hidden="true"
              >
                Estudiante
              </p>
              <h2 className="mt-0.5 truncate text-[15px] font-semibold leading-snug text-[var(--foreground)]">
                {studentName}
              </h2>
              <p className="truncate text-[12px] text-[var(--foreground-muted)]">{studentCareer}</p>
            </div>
          </div>

          {/* Stats grid */}
          <div
            className="mt-5 grid grid-cols-2 gap-2.5"
            role="group"
            aria-label="Datos académicos"
          >
            <div className="surface-elevated rounded-xl px-3.5 py-3">
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--foreground-muted)]">Plan</p>
              <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">{studentPlan}</p>
            </div>
            <div className="surface-elevated rounded-xl px-3.5 py-3">
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--foreground-muted)]">Índice</p>
              <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">{studentIndex}</p>
            </div>
          </div>

          {/* Status badges */}
          <div
            className="mt-3.5 flex flex-wrap gap-2"
            role="group"
            aria-label="Estado del estudiante"
          >
            <div
              className={`inline-flex items-center rounded-full border px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] ${financialStatusClass(morosidad?.status)}`}
              aria-label={`Estado financiero: ${financialStatusLabel(morosidad?.status)}`}
            >
              {financialStatusLabel(morosidad?.status)}
            </div>
            <div
              className="status-neutral inline-flex items-center rounded-full border px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.14em]"
              aria-live="polite"
            >
              {shellStatus}
            </div>
          </div>

          {/* Navigation */}
          <nav
            className="mt-5 grid grid-cols-2 gap-2 lg:grid-cols-1"
            aria-label="Navegación principal"
          >
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "rounded-xl px-3.5 py-2.5 text-[13.5px] font-medium",
                    "transition-all duration-200 focus-visible:outline-none",
                    "focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                    active ? "nav-link nav-link-active" : "nav-link",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="mt-5 grid gap-2">
            <button
              type="button"
              onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}
              aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              aria-pressed={theme === "dark"}
              className="btn-secondary rounded-xl px-3.5 py-2.5 text-[13.5px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            >
              {theme === "dark" ? "Modo claro" : "Modo oscuro"}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              aria-busy={isLoggingOut}
              className="btn-primary rounded-xl px-3.5 py-2.5 text-[13.5px] font-semibold disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            >
              {isLoggingOut ? "Cerrando..." : "Cerrar sesión"}
            </button>
          </div>
        </aside>

        {/* ── Main content ── */}
        <section
          className="shell-main rounded-2xl px-5 py-6 sm:px-7 xl:px-9"
          aria-label="Contenido principal"
        >
          <header className="divider-default mb-7 border-b pb-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p
                  className="section-kicker text-[10px] font-semibold uppercase tracking-[0.22em]"
                  aria-hidden="true"
                >
                  Plataforma académica
                </p>
                <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                  {env.appName}
                </h1>
                <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-[var(--foreground-soft)]">
                  Visualización académica clara para consultar expediente, avance, analytics, recovery y datos clave del estudiante.
                </p>
              </div>
              <div
                className="surface-elevated rounded-xl px-4 py-3 text-right"
                aria-live="polite"
                aria-label={`Estado actual: ${shellStatus}`}
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--foreground-muted)]">
                  Estado actual
                </p>
                <p className="mt-1 text-[13px] font-semibold text-[var(--foreground)]">{shellStatus}</p>
              </div>
            </div>
          </header>

          {error ? (
            <div
              role="alert"
              aria-live="assertive"
              className="status-danger mb-6 rounded-xl border px-4 py-3 text-[13px] font-medium"
            >
              {error}
            </div>
          ) : null}

          <div className="space-y-5">{children}</div>
        </section>
      </div>
    </main>
  );
}
