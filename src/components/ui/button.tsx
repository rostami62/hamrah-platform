import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

const VARIANT_CLASSES = {
  primary: "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800",
  accent: "bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-700",
  ghost: "bg-transparent text-primary-700 hover:bg-primary-50",
} as const;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof VARIANT_CLASSES;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "rounded-[var(--radius-control)] px-4 py-2.5 text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50",
          VARIANT_CLASSES[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
