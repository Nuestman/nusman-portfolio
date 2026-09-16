import { type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant =
  | "default"
  | "outline"
  | "secondary"
  | "ghost"
  | "link"
  | "destructive";
type ButtonSize = "default" | "sm" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

function buttonVariantClass(variant: ButtonVariant): string {
  switch (variant) {
    case "default":
      return "bg-gold-500 text-white hover:bg-gold-600";
    case "outline":
      return "border border-gold-500 bg-transparent text-gold-500 hover:bg-gold-500 hover:text-white";
    case "secondary":
      return "bg-gray-100 text-gray-900 hover:bg-gray-200";
    case "ghost":
      return "hover:bg-gray-100 hover:text-gray-900";
    case "link":
      return "h-auto rounded-none px-0 text-gold-500 underline decoration-gold-500/50 underline-offset-2 hover:bg-transparent hover:text-gold-600";
    case "destructive":
      return "bg-red-500 text-white hover:bg-red-600";
    default: {
      const exhaustive: never = variant;
      return exhaustive;
    }
  }
}

function buttonSizeClass(size: ButtonSize, variant: ButtonVariant): string {
  if (variant === "link") {
    return "";
  }

  switch (size) {
    case "default":
      return "h-10 px-4 py-2";
    case "sm":
      return "h-9 px-3";
    case "lg":
      return "h-11 px-8";
    default: {
      const exhaustive: never = size;
      return exhaustive;
    }
  }
}

export function buttonClassName(
  variant: ButtonVariant = "default",
  size: ButtonSize = "default",
) {
  return cn(
    "inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
    buttonVariantClass(variant),
    buttonSizeClass(size, variant),
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
