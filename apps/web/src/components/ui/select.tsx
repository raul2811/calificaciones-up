import * as React from "react";

import { cn } from "@/lib/utils";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "field-control flex h-11 w-full rounded-xl px-3.5 py-2.5 text-sm outline-none",
      className,
    )}
    {...props}
  />
));
Select.displayName = "Select";
