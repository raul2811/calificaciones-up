"use client";

import Link from "next/link";

type RootErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function RootError({ error, reset }: RootErrorProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-10">
      <section className="surface-panel w-full max-w-xl rounded-xl p-8">
        <p className="section-kicker">Error</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-primary">
          Ocurrió un problema al cargar la aplicación
        </h1>
        <p className="mt-4 text-sm leading-7 text-foreground-soft">
          {error.message || "No fue posible completar la solicitud."}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={reset} className="landing-button landing-button-primary">
            Reintentar
          </button>
          <Link href="/" className="landing-button landing-button-secondary">
            Volver al inicio
          </Link>
        </div>
      </section>
    </main>
  );
}
