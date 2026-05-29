import * as React from "react";

import { cn } from "@/lib/utils";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "field-control flex h-10 w-full rounded-xl px-3.5 py-2 text-sm",
      "outline-none transition-all duration-200 cursor-pointer",
      "focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-0",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Select.displayName = "Select";
