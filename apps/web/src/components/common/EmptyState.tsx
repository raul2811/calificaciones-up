import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <section className={cn("empty-state rounded-xl p-6 text-center", className)}>
      <h2 className="text-base font-semibold text-primary">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-foreground-soft">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </section>
  );
}
