import { EmptyState } from "@/components/common/EmptyState";
import { MetricsSkeleton } from "@/features/student/components/DashboardSkeletons";

type StudentPageStateProps = {
  title: string;
  description?: string;
};

export function StudentPageLoadingState({ title, description }: StudentPageStateProps) {
  return (
    <section className="surface-panel rounded-xl p-6">
      <p className="section-kicker">Cargando</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-primary">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-foreground-soft">
        {description || "Cargando información académica."}
      </p>
      <div className="mt-6">
        <MetricsSkeleton />
      </div>
    </section>
  );
}

export function StudentPageErrorState({ title, description }: StudentPageStateProps) {
  return (
    <EmptyState
      title={title}
      description={description || "No fue posible cargar la información."}
      className="status-danger border rounded-xl text-left"
    />
  );
}
