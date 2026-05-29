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
      "inline-flex items-center justify-center gap-2 rounded-[1.1rem] px-5 py-2.5 text-sm font-bold tracking-wide",
      "transition-all duration-300 ease-out hover:-translate-y-[1px] hover:shadow-md",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-1",
      "disabled:pointer-events-none disabled:opacity-40",
      "active:scale-[0.97]",
      variantClass(variant),
      className,
    )}
    {...props}
  />
));
Button.displayName = "Button";
