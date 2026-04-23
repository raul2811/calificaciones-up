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
      "inline-flex items-center justify-center rounded-xl px-3.5 py-2.5 text-sm font-semibold transition focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
      variantClass(variant),
      className,
    )}
    {...props}
  />
));
Button.displayName = "Button";
