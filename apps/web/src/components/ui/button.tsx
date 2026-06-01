import * as React from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "outline";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

function variantClass(variant: ButtonVariant): string {
  switch (variant) {
    case "outline":
      return "btn-secondary";
    case "default":
    default:
      return "btn-primary";
  }
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant = "default", ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold",
      "shadow-sm",
      "focus-visible:outline-none",
      "disabled:pointer-events-none disabled:opacity-40",
      variantClass(variant),
      className,
    )}
    {...props}
  />
));
Button.displayName = "Button";
