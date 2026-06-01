export default function RootLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-10">
      <section className="surface-panel w-full max-w-md rounded-xl p-8 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
        <p className="mt-4 text-sm font-medium text-foreground-soft">
          Cargando la plataforma académica.
        </p>
      </section>
    </main>
  );
}
