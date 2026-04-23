"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { getSession, logout } from "@/features/auth/api";
import { StudentPhoto } from "@/features/student/components/StudentPhoto";
import { useStudentData } from "@/features/student/context/StudentDataContext";
import { env } from "@/lib/env";

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
      setError("No fue posible cerrar sesion.");
      setIsLoggingOut(false);
    }
  }

  if (isCheckingSession) {
    return (
      <main className="min-h-screen p-4">
        <section className="surface-hero mx-auto w-full max-w-7xl rounded-[1.75rem] p-8">
          <p className="text-sm font-medium text-foreground-soft">Verificando sesion...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto grid min-h-screen w-full max-w-[1920px] grid-cols-1 gap-5 px-3 py-3 lg:grid-cols-[320px_1fr] lg:px-4 lg:py-4">
        <aside className="shell-sidebar rounded-[1.9rem] px-5 py-5 lg:px-6 lg:py-6">
          <div className="flex items-start gap-3">
            <StudentPhoto name={studentName} size={64} roundedClassName="rounded-2xl" />
            <div className="min-w-0 flex-1">
              <p className="section-kicker text-[11px] font-semibold uppercase tracking-[0.18em]">Estudiante</p>
              <h2 className="mt-1 truncate text-lg font-semibold text-primary">{studentName}</h2>
              <p className="truncate text-sm text-foreground-muted">{studentCareer}</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 text-xs text-foreground-soft">
            <div className="surface-elevated rounded-2xl px-3 py-3">
              <p className="text-[11px] uppercase tracking-[0.16em] text-foreground-muted">Plan</p>
              <p className="mt-1 text-sm font-semibold text-primary">{studentPlan}</p>
            </div>
            <div className="surface-elevated rounded-2xl px-3 py-3">
              <p className="text-[11px] uppercase tracking-[0.16em] text-foreground-muted">Indice</p>
              <p className="mt-1 text-sm font-semibold text-primary">{studentIndex}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <div
              className={`inline-flex rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] ${financialStatusClass(
                morosidad?.status,
              )}`}
            >
              {financialStatusLabel(morosidad?.status)}
            </div>
            <div className="status-neutral inline-flex rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em]">
              {shellStatus}
            </div>
          </div>

          <nav className="mt-6 grid grid-cols-2 gap-2.5 text-sm lg:grid-cols-1">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-2xl px-3.5 py-3 font-medium transition-all duration-200 ${
                    active ? "nav-link nav-link-active" : "nav-link"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 grid gap-2">
            <button
              type="button"
              onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}
              className="btn-secondary rounded-2xl px-3.5 py-3 text-sm font-semibold"
            >
              {theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="btn-primary rounded-2xl px-3.5 py-3 text-sm font-semibold disabled:opacity-60"
            >
              {isLoggingOut ? "Cerrando..." : "Cerrar sesion"}
            </button>
          </div>
        </aside>

        <section className="shell-main rounded-[1.9rem] px-4 py-5 sm:px-6 xl:px-8 2xl:px-10">
          <header className="divider-default mb-6 border-b pb-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="section-kicker text-[11px] font-semibold uppercase tracking-[0.2em]">
                  Plataforma academica
                </p>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-primary">{env.appName}</h1>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-foreground-soft">
                  Visualizacion academica clara para consultar expediente, avance, analytics, recovery y datos clave del estudiante.
                </p>
              </div>
              <div className="surface-elevated rounded-2xl px-4 py-3 text-right">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground-muted">Estado actual</p>
                <p className="mt-1 text-sm font-semibold text-primary">{shellStatus}</p>
              </div>
            </div>
          </header>

          {error ? (
            <p className="status-danger mb-5 rounded-2xl border px-4 py-3 text-sm font-medium">
              {error}
            </p>
          ) : null}

          <div className="space-y-6">{children}</div>
        </section>
      </div>
    </main>
  );
}
