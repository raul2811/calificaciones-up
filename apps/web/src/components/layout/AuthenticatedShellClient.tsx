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
  { href: "/plan", label: "Plan de Estudios" },
  { href: "/pendientes", label: "Pendientes" },
  { href: "/analytics", label: "Analytics" },
  { href: "/recovery", label: "Recovery" },
  { href: "/profesores", label: "Profesores" },
  { href: "/morosidad", label: "Morosidad" },
  { href: "/perfil", label: "Perfil del Estudiante" },
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
    return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
  }
  if (normalized === "moroso") {
    return "bg-rose-500/10 text-rose-600 border-rose-500/20";
  }
  return "bg-[var(--surface-muted)] text-[var(--foreground-muted)] border-[var(--border)]";
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
        if (!isMounted) return;
        if (!session.authenticated) {
          router.replace("/login");
          return;
        }
        setIsCheckingSession(false);
      } catch {
        if (!isMounted) return;
        router.replace("/login");
      }
    }
    void checkSession();
    return () => { isMounted = false; };
  }, [router]);

  const studentName = normalizeText(student.name, "Estudiante");
  const studentCareer = normalizeText(student.career);
  const studentPlan = normalizeText(student.plan);
  const studentIndex = normalizeText(student.currentIndex);

  const shellStatus = useMemo(() => {
    if (state.status === "loading") return "Cargando expediente...";
    if (state.status === "error") return "Error cargando expediente";
    if (state.status === "empty") return "Sin materias registradas";
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
      <main className="min-h-screen p-4 flex items-center justify-center bg-[var(--background)]" role="main">
        <section className="surface-hero rounded-3xl p-12 max-w-sm w-full shadow-2xl flex flex-col items-center gap-6" aria-label="Verificando sesión">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--accent)] border-t-transparent shadow-[0_0_15px_var(--accent-glow)]" />
          <p className="text-base font-semibold text-[var(--foreground)] tracking-wide">Validando acceso...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] selection:bg-[var(--accent)] selection:text-white" role="main">
      <div className="mx-auto grid min-h-screen w-full max-w-[1920px] grid-cols-1 gap-6 p-4 lg:grid-cols-[320px_1fr] lg:p-6">

        {/* ── Sidebar Premium ── */}
        <aside
          className="surface-panel rounded-[2rem] px-6 py-8 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:self-start lg:overflow-y-auto lg:px-6 lg:py-8 border border-[var(--border)] shadow-xl backdrop-blur-3xl flex flex-col"
          aria-label="Panel de navegación"
        >
          {/* Student identity */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-strong)] rounded-2xl blur opacity-30 group-hover:opacity-70 transition duration-500" />
              <StudentPhoto name={studentName} size={60} roundedClassName="rounded-[1.1rem] relative z-10" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--accent)]" aria-hidden="true">
                Universidad de Panamá
              </p>
              <h2 className="mt-1 truncate text-lg font-black leading-tight text-[var(--foreground)]">
                {studentName}
              </h2>
              <p className="mt-0.5 truncate text-[12px] font-medium text-[var(--foreground-muted)]">{studentCareer}</p>
            </div>
          </div>

          {/* Stats grid */}
          <div className="mt-8 grid grid-cols-2 gap-3" role="group" aria-label="Datos académicos">
            <div className="surface-elevated rounded-2xl px-4 py-3.5 border border-[var(--border-soft)] shadow-sm hover:border-[var(--accent)] transition-colors duration-300">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--foreground-muted)] mb-1">Plan</p>
              <p className="text-sm font-black text-[var(--foreground)] truncate">{studentPlan}</p>
            </div>
            <div className="surface-elevated rounded-2xl px-4 py-3.5 border border-[var(--border-soft)] shadow-sm hover:border-[var(--accent)] transition-colors duration-300">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--foreground-muted)] mb-1">Índice</p>
              <p className="text-sm font-black text-[var(--accent)] truncate">{studentIndex}</p>
            </div>
          </div>

          {/* Status badges */}
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Estado del estudiante">
            <div className={`inline-flex items-center rounded-full border px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] backdrop-blur-sm ${financialStatusClass(morosidad?.status)}`}>
              <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
              {financialStatusLabel(morosidad?.status)}
            </div>
            <div className="bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--ring)] inline-flex items-center rounded-full border px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] backdrop-blur-sm">
              <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
              {shellStatus}
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-8 flex flex-col gap-1.5 flex-1" aria-label="Navegación principal">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "relative flex items-center rounded-xl px-4 py-3 text-[14px] font-bold tracking-wide overflow-hidden",
                    "transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                    active 
                      ? "text-white shadow-md shadow-[var(--accent-glow)] translate-x-1" 
                      : "text-[var(--foreground-soft)] hover:text-[var(--foreground)] hover:bg-[var(--surface-elevated)] hover:translate-x-1",
                  ].join(" ")}
                >
                  {active && (
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-strong)] -z-10" />
                  )}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="mt-8 pt-6 border-t border-[var(--border-soft)] grid gap-3">
            <button
              type="button"
              onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}
              aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              aria-pressed={theme === "dark"}
              className="btn-secondary rounded-xl px-4 py-3 text-[13px] font-bold tracking-wide focus-visible:outline-none hover:-translate-y-0.5"
            >
              {theme === "dark" ? "☀️ Modo Claro" : "🌙 Modo Oscuro"}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="bg-transparent border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl px-4 py-3 text-[13px] font-bold tracking-wide transition-all duration-300 disabled:opacity-50 hover:-translate-y-0.5"
            >
              {isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
            </button>
          </div>
        </aside>

        {/* ── Main content ── */}
        <section
          className="surface-main rounded-[2rem] border border-[var(--border)] shadow-2xl bg-[var(--surface)] backdrop-blur-3xl px-6 py-8 sm:px-10 lg:px-12 relative overflow-hidden"
          aria-label="Contenido principal"
        >
          {/* Elemento decorativo de fondo */}
          <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-[var(--accent-glow)] blur-[120px] pointer-events-none opacity-50" />

          <header className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-[var(--border-soft)] pb-8 relative z-10">
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface-elevated)] border border-[var(--border-soft)] mb-4">
                <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--foreground-muted)]">
                  Plataforma Académica
                </p>
              </div>
              <h1 className="text-4xl font-black tracking-tight text-[var(--foreground)] leading-tight">
                {env.appName}
              </h1>
              <p className="mt-3 max-w-2xl text-[15px] font-medium leading-relaxed text-[var(--foreground-soft)]">
                Consulta tu expediente, analiza tu progreso, y mantén el control de tu información académica con claridad y precisión.
              </p>
            </div>
            
            <div className="surface-elevated rounded-2xl px-5 py-4 text-right border border-[var(--border-strong)] shadow-lg backdrop-blur-md animate-fade-in-up delay-100">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--foreground-muted)] mb-1">
                Estado del Sistema
              </p>
              <div className="flex items-center justify-end gap-2">
                <span className="text-sm font-black text-[var(--foreground)]">{shellStatus}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              </div>
            </div>
          </header>

          {error && (
            <div role="alert" className="animate-fade-in-up bg-rose-500/10 border border-rose-500/30 text-rose-500 mb-8 rounded-2xl px-5 py-4 text-sm font-bold shadow-sm flex items-center gap-3 relative z-10">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-rose-500/20">!</span>
              {error}
            </div>
          )}

          <div className="relative z-10 animate-fade-in-up delay-200">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
