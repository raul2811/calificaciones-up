import * as React from "react";

import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "field-control flex h-11 w-full rounded-xl px-4 py-2 text-sm font-medium",
      "outline-none transition-all duration-300 shadow-sm",
      "placeholder:text-[var(--foreground-muted)]",
      "focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-0",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
