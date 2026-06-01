import { Skeleton } from "@/components/ui/skeleton";

export function AuthenticatedShellSkeleton() {
  return (
    <main className="min-h-screen bg-[var(--background)]" role="main" aria-busy="true">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col gap-4 p-4 lg:flex-row lg:gap-6 lg:p-6">
        <aside className="shell-sidebar hidden w-[292px] shrink-0 rounded-xl p-5 lg:block">
          <div className="flex items-center gap-3">
            <Skeleton className="h-14 w-14 rounded-lg" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
          </div>

          <div className="mt-4 flex gap-2">
            <Skeleton className="h-7 w-24 rounded-full" />
            <Skeleton className="h-7 w-32 rounded-full" />
          </div>

          <div className="mt-6 space-y-2">
            {Array.from({ length: 8 }, (_, index) => (
              <Skeleton key={index} className="h-[68px] rounded-lg" />
            ))}
          </div>
        </aside>

        <section className="shell-main min-w-0 flex-1 rounded-xl p-4 sm:p-5 lg:p-7">
          <header className="border-b border-[var(--border)] pb-4">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="mt-4 h-10 w-64" />
            <Skeleton className="mt-3 h-4 w-full max-w-2xl" />
            <Skeleton className="mt-2 h-4 w-full max-w-xl" />
            <div className="mt-4 flex gap-2">
              <Skeleton className="h-7 w-24 rounded-full" />
              <Skeleton className="h-7 w-32 rounded-full" />
            </div>
          </header>

          <div className="mt-6 space-y-6">
            <Skeleton className="h-40 rounded-xl" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {Array.from({ length: 5 }, (_, index) => (
                <Skeleton key={index} className="h-36 rounded-xl" />
              ))}
            </div>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_1.1fr_0.8fr]">
              <Skeleton className="h-72 rounded-xl" />
              <Skeleton className="h-72 rounded-xl" />
              <Skeleton className="h-72 rounded-xl" />
            </div>
            <Skeleton className="h-72 rounded-xl" />
          </div>
        </section>
      </div>
    </main>
  );
}
