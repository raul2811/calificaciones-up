import * as React from "react";

import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "secondary" | "outline" | "success" | "warning" | "danger";

type BadgeProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: BadgeVariant;
};

function variantClass(variant: BadgeVariant): string {
  switch (variant) {
    case "secondary":
      return "status-neutral";
    case "outline":
      return "surface-elevated text-foreground-soft";
    case "success":
      return "status-success";
    case "warning":
      return "status-warning";
    case "danger":
      return "status-danger";
    case "default":
    default:
      return "status-info";
  }
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors",
        variantClass(variant),
        className,
      )}
      {...props}
    />
  );
}
