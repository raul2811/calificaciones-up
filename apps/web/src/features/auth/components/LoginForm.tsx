"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  CLASE_OPTIONS,
  FOLIO_MAX_LENGTH,
  NUMERIC_ONLY_REGEX,
  PROVINCIA_OPTIONS,
  TOMO_MAX_LENGTH,
} from "@/features/auth/constants";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { login } from "@/features/auth/api";
import type { AuthRequest, ClaseCode, ProvinciaCode } from "@/features/auth/types";
import { ApiClientError } from "@/lib/api/client";
import { env } from "@/lib/env";
import Link from "next/link";

type FormState = {
  provincia: ProvinciaCode;
  clase: ClaseCode;
  tomo: string;
  folio: string;
  password: string;
};

function validateForm(values: FormState): string | null {
  if (!PROVINCIA_OPTIONS.includes(values.provincia)) {
    return "Provincia invalida.";
  }

  if (!CLASE_OPTIONS.includes(values.clase)) {
    return "Clase invalida.";
  }

  if (!values.tomo || !NUMERIC_ONLY_REGEX.test(values.tomo) || values.tomo.length > TOMO_MAX_LENGTH) {
    return `Tomo debe ser numerico y tener maximo ${TOMO_MAX_LENGTH} digitos.`;
  }

  if (!values.folio || !NUMERIC_ONLY_REGEX.test(values.folio) || values.folio.length > FOLIO_MAX_LENGTH) {
    return `Folio debe ser numerico y tener maximo ${FOLIO_MAX_LENGTH} digitos.`;
  }

  if (!values.password.trim()) {
    return "Password es requerido.";
  }

  return null;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    if (error.code === "HTTP_ERROR" && typeof error.details === "object" && error.details !== null) {
      const details = error.details as { error?: string; message?: string };
      if (typeof details.error === "string" && details.error.trim()) {
        return details.error;
      }
      if (typeof details.message === "string" && details.message.trim()) {
        return details.message;
      }
    }

    return "No fue posible iniciar sesion.";
  }

  return "Error inesperado. Intenta nuevamente.";
}

export function LoginForm() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    provincia: PROVINCIA_OPTIONS[0],
    clase: CLASE_OPTIONS[0],
    tomo: "",
    folio: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => !isLoading, [isLoading]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const validationError = validateForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    const payload: AuthRequest = {
      provincia: form.provincia,
      clase: form.clase,
      tomo: form.tomo,
      folio: form.folio,
      password: form.password,
    };

    setIsLoading(true);

    try {
      const result = await login(payload);

      if (result.authenticated) {
        router.push("/dashboard");
        return;
      }

      setError("Credenciales invalidas.");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6">
        <Link href="/" className="section-kicker text-sm font-semibold uppercase tracking-[0.22em]">
          Calificaciones UP
        </Link>
        <p className="text-sm text-foreground-muted">Acceso para estudiantes</p>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-76px)] w-full max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[0.95fr_0.75fr] lg:items-center lg:px-6 lg:py-12">
        <article className="surface-hero hidden rounded-[2rem] p-10 lg:block">
          <p className="section-kicker text-[11px] font-semibold uppercase tracking-[0.24em]">Acceso institucional</p>
          <h1 className="mt-4 max-w-xl text-5xl font-semibold tracking-tight text-primary">
            Consulta tu expediente academico con una interfaz mas clara y profesional
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-foreground-soft">
            Ingresa para revisar dashboard, plan academico, analytics, pendientes, recovery, profesores y morosidad dentro de {env.appName}.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              ["Notas y avance", "Resumenes claros para leer el progreso real del estudiante."],
              ["Plan y pendientes", "Tabla mas util para detectar bloqueos y materias por resolver."],
              ["Analytics", "Graficas y distribuciones integradas a la consulta academica."],
              ["Estado financiero", "Morosidad y paz y salvo dentro del mismo flujo."],
            ].map(([title, description]) => (
              <div key={title} className="surface-elevated rounded-[1.4rem] p-5">
                <h2 className="text-base font-semibold text-primary">{title}</h2>
                <p className="mt-2 text-sm leading-7 text-foreground-soft">{description}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="surface-hero w-full max-w-xl justify-self-center rounded-[2rem] p-8 sm:p-9">
          <div className="mb-8">
            <div className="btn-primary mb-5 flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-semibold">UP</div>
            <p className="section-kicker text-[11px] font-semibold uppercase tracking-[0.22em]">Iniciar sesion</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-primary">{env.appName}</h2>
            <p className="mt-3 text-sm leading-7 text-foreground-soft">Accede a tu historial academico con tus credenciales actuales.</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="provincia" className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground-muted">
                  Provincia
                </label>
                <Select
                  id="provincia"
                  name="provincia"
                  value={form.provincia}
                  onChange={(event) => setForm((prev) => ({ ...prev, provincia: event.target.value as ProvinciaCode }))}
                  disabled={isLoading}
                >
                  {PROVINCIA_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label htmlFor="clase" className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground-muted">
                  Clase
                </label>
                <Select
                  id="clase"
                  name="clase"
                  value={form.clase}
                  onChange={(event) => setForm((prev) => ({ ...prev, clase: event.target.value as ClaseCode }))}
                  disabled={isLoading}
                >
                  {CLASE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="tomo" className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground-muted">
                  Tomo
                </label>
                <Input
                  id="tomo"
                  name="tomo"
                  type="text"
                  inputMode="numeric"
                  maxLength={TOMO_MAX_LENGTH}
                  value={form.tomo}
                  onChange={(event) => setForm((prev) => ({ ...prev, tomo: event.target.value.trim() }))}
                  disabled={isLoading}
                  required
                />
              </div>

              <div>
                <label htmlFor="folio" className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground-muted">
                  Folio
                </label>
                <Input
                  id="folio"
                  name="folio"
                  type="text"
                  inputMode="numeric"
                  maxLength={FOLIO_MAX_LENGTH}
                  value={form.folio}
                  onChange={(event) => setForm((prev) => ({ ...prev, folio: event.target.value.trim() }))}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground-muted">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                disabled={isLoading}
                required
              />
            </div>

            {error ? (
              <p className="status-danger rounded-2xl border px-4 py-3 text-sm font-medium">{error}</p>
            ) : null}

            <button
              type="submit"
              disabled={!canSubmit}
              className="btn-primary mt-2 w-full rounded-xl px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Ingresando..." : "Entrar al portal"}
            </button>
          </form>

          <div className="mt-7 flex flex-wrap items-center justify-between gap-3 text-xs text-foreground-muted">
            <p className="text-foreground-muted">
              <span className="mr-1 inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ background: "var(--chart-success)", boxShadow: "0 0 14px var(--success-border)" }} />
              Estado del sistema: operativo
            </p>
            <Link href="/" className="section-kicker font-semibold transition hover:text-primary">
              Volver al inicio
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}
