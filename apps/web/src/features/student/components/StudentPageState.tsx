type StudentPageStateProps = {
  title: string;
  description?: string;
};

export function StudentPageLoadingState({ title, description }: StudentPageStateProps) {
  return (
    <section className="surface-hero rounded-[1.75rem] p-7">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="section-kicker text-[11px] font-semibold uppercase tracking-[0.2em]">Cargando</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-primary">{title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-foreground-soft">
            {description || "Cargando informacion academica..."}
          </p>
        </div>
        <div className="grid min-w-[280px] grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="surface-elevated animate-pulse rounded-2xl p-4">
              <div className="h-3 w-20 rounded-full" style={{ background: "var(--surface-strong)" }} />
              <div className="mt-4 h-7 w-16 rounded-full" style={{ background: "var(--surface-strong)" }} />
              <div className="mt-3 h-2 w-full rounded-full" style={{ background: "var(--surface-strong)" }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function StudentPageErrorState({ title, description }: StudentPageStateProps) {
  return (
    <section className="status-danger rounded-[1.75rem] border p-7 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em]">Error</p>
      <h2 className="mt-3 text-xl font-semibold">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-7">
        {description || "No fue posible cargar la informacion."}
      </p>
    </section>
  );
}
