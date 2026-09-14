import { type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "outline" | "secondary" | "ghost" | "destructive";
type ButtonSize = "default" | "sm" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function buttonClassName(
  variant: ButtonVariant = "default",
  size: ButtonSize = "default",
) {
  return cn(
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    variant === "default" && "bg-gold-500 text-white hover:bg-gold-600",
    variant === "outline" &&
      "border border-gold-500 bg-transparent text-gold-500 hover:bg-gold-500 hover:text-white",
    variant === "secondary" && "bg-gray-100 text-gray-900 hover:bg-gray-200",
    variant === "ghost" && "hover:bg-gray-100 hover:text-gray-900",
    variant === "destructive" && "bg-red-500 text-white hover:bg-red-600",
    size === "default" && "h-10 px-4 py-2",
    size === "sm" && "h-9 px-3",
    size === "lg" && "h-11 px-8",
  );
}

export function Button({
  className,
  variant = "default",
  size = "default",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonClassName(variant, size), className)}
      {...props}
    />
  );
}
