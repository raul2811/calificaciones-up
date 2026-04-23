import * as React from "react";

import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "field-control flex h-11 w-full rounded-xl px-3.5 py-2.5 text-sm outline-none",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
