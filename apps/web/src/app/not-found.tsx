import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-10">
      <section className="surface-panel w-full max-w-xl rounded-xl p-8 text-center">
        <p className="section-kicker">404</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-primary">
          La página no está disponible
        </h1>
        <p className="mt-4 text-sm leading-7 text-foreground-soft">
          Revisa la ruta o vuelve al inicio para continuar con la consulta académica.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/" className="landing-button landing-button-primary">
            Ir al inicio
          </Link>
          <Link href="/login" className="landing-button landing-button-secondary">
            Iniciar sesión
          </Link>
        </div>
      </section>
    </main>
  );
}
