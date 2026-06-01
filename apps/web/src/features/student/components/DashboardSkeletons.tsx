import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type DashboardSectionErrorProps = {
  title: string;
  description: string;
  onRetry?: () => void;
};

export function DashboardSectionError({
  title,
  description,
  onRetry,
}: DashboardSectionErrorProps) {
  return (
    <section className="surface-panel rounded-xl border border-rose-500/20 p-5">
      <p className="section-kicker text-rose-500">Error de carga</p>
      <h3 className="mt-2 text-lg font-semibold text-primary">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-foreground-soft">{description}</p>
      {onRetry ? (
        <Button type="button" variant="outline" onClick={onRetry} className="mt-4">
          Reintentar
        </Button>
      ) : null}
    </section>
  );
}

export function DashboardHeaderSkeleton() {
  return (
    <section className="surface-hero rounded-xl p-6 lg:p-7">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="flex items-center gap-6">
          <Skeleton className="h-[88px] w-[88px] rounded-xl" />
          <div className="min-w-0">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="mt-4 h-10 w-72 max-w-full" />
            <Skeleton className="mt-3 h-4 w-56 max-w-full" />
          </div>
        </div>

        <div className="grid flex-1 grid-cols-2 gap-3 lg:ml-auto xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <article key={index} className="surface-elevated rounded-lg p-4">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="mt-3 h-7 w-20" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function DashboardFinancialSkeleton() {
  return (
    <section className="surface-hero rounded-xl p-5 lg:p-6">
      <Skeleton className="h-3 w-28" />
      <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
        <div>
          <Skeleton className="h-10 w-56" />
          <Skeleton className="mt-3 h-4 w-40" />
        </div>
        <Skeleton className="h-10 w-28 rounded-full" />
      </div>
    </section>
  );
}

export function MetricsSkeleton() {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {Array.from({ length: 10 }, (_, index) => (
        <article key={index} className="surface-panel rounded-xl p-5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-4 h-10 w-20" />
          <Skeleton className="mt-4 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-2/3" />
        </article>
      ))}
    </section>
  );
}

export function AnalyticsSkeleton() {
  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_1.1fr_0.8fr]">
      {Array.from({ length: 2 }, (_, index) => (
        <article key={index} className="surface-panel rounded-[1.6rem] p-5">
          <Skeleton className="h-3 w-32" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 5 }, (_, itemIndex) => (
              <div key={itemIndex} className="rounded-2xl border border-[var(--border)] p-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-10" />
                </div>
                <Skeleton className="mt-3 h-2.5 w-full rounded-full" />
              </div>
            ))}
          </div>
        </article>
      ))}

      <article className="surface-hero rounded-[1.6rem] p-5">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="mt-5 h-12 w-24" />
        <Skeleton className="mt-5 h-3 w-full rounded-full" />
        <div className="mt-5 grid gap-3">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      </article>
    </section>
  );
}

export function BlockingSubjectsSkeleton() {
  return (
    <section className="surface-panel rounded-[2rem] p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Skeleton className="h-3 w-32" />
          <Skeleton className="mt-3 h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="h-9 w-28 rounded-full" />
      </div>

      <div className="table-shell overflow-hidden rounded-[1.4rem]">
        <div className="hidden grid-cols-[0.7fr_1.6fr_0.8fr_0.6fr_0.7fr_1.6fr_0.8fr] gap-3 border-b border-[var(--border)] px-4 py-4 md:grid">
          {Array.from({ length: 7 }, (_, index) => (
            <Skeleton key={index} className="h-4 w-full" />
          ))}
        </div>
        <div className="space-y-3 p-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="grid gap-3 md:grid-cols-[0.7fr_1.6fr_0.8fr_0.6fr_0.7fr_1.6fr_0.8fr]">
              {Array.from({ length: 7 }, (_, cellIndex) => (
                <Skeleton key={cellIndex} className="h-10 w-full rounded-lg" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SummarySkeleton() {
  return (
    <section className="surface-hero rounded-[2rem] p-6 lg:p-8">
      <Skeleton className="h-7 w-40 rounded-full" />
      <Skeleton className="mt-5 h-8 w-56" />
      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <article key={index} className="surface-elevated rounded-[1.6rem] p-6">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-4 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-5/6" />
            <Skeleton className="mt-2 h-4 w-3/5" />
          </article>
        ))}
      </div>
    </section>
  );
}

export function DashboardOverviewSkeleton() {
  return (
    <div className="space-y-6">
      <DashboardHeaderSkeleton />
      <DashboardFinancialSkeleton />
      <MetricsSkeleton />
      <AnalyticsSkeleton />
      <BlockingSubjectsSkeleton />
      <SummarySkeleton />
    </div>
  );
}

export function TableSectionSkeleton() {
  return (
    <section className="surface-panel overflow-hidden rounded-xl p-5 lg:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-3 h-5 w-72 max-w-full" />
          <Skeleton className="mt-2 h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>

      <div className="space-y-3 md:hidden">
        {Array.from({ length: 4 }, (_, index) => (
          <article key={index} className="surface-elevated rounded-lg p-4">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="mt-2 h-4 w-24" />
            <div className="mt-4 grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }, (_, itemIndex) => (
                <div key={itemIndex}>
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="mt-2 h-4 w-20" />
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className="table-shell hidden overflow-hidden rounded-lg md:block">
        <div className="grid grid-cols-11 gap-3 border-b border-[var(--border)] px-4 py-4">
          {Array.from({ length: 11 }, (_, index) => (
            <Skeleton key={index} className="h-4 w-full" />
          ))}
        </div>
        <div className="space-y-3 p-4">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="grid grid-cols-11 gap-3">
              {Array.from({ length: 11 }, (_, cellIndex) => (
                <Skeleton key={cellIndex} className="h-9 w-full rounded-md" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
