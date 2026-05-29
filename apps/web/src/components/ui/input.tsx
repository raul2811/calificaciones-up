import * as React from "react";

import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "field-control flex h-10 w-full rounded-xl px-3.5 py-2 text-sm",
      "outline-none transition-all duration-200",
      "placeholder:text-[var(--foreground-muted)]",
      "focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-0",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
