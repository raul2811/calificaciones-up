import { cn } from "@/lib/utils";

type PageIntroProps = {
  title: string;
  description: string;
  eyebrow?: string;
  aside?: React.ReactNode;
  className?: string;
};

export function PageIntro({
  title,
  description,
  eyebrow,
  aside,
  className,
}: PageIntroProps) {
  return (
    <section className={cn("surface-hero rounded-xl p-5 lg:p-6", className)}>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          {eyebrow ? <p className="section-kicker">{eyebrow}</p> : null}
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-7 text-foreground-soft">{description}</p>
        </div>
        {aside ? <div className="lg:min-w-[220px]">{aside}</div> : null}
      </div>
    </section>
  );
}
