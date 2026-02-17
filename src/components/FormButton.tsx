"use client";

import type { ButtonHTMLAttributes } from "react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/cn";
import { Spinner } from "@/components/Spinner";

type FormButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  pendingText?: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
};

const variants: Record<NonNullable<FormButtonProps["variant"]>, string> = {
  primary:
    "bg-primary-600 text-white hover:bg-primary-700 disabled:bg-primary-600/70",
  secondary:
    "border border-slate-200 bg-white text-slate-700 hover:border-primary-200 hover:text-primary-700",
  ghost: "text-slate-600 hover:text-primary-700",
};

const sizes: Record<NonNullable<FormButtonProps["size"]>, string> = {
  sm: "px-3 py-2 text-xs",
  md: "px-4 py-2 text-sm",
};

export function FormButton({
  children,
  pendingText,
  className,
  variant = "primary",
  size = "md",
  disabled,
  ...props
}: FormButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      {...props}
      disabled={disabled || pending}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {pending ? (
        <>
          <Spinner className="h-4 w-4" />
          <span>{pendingText ?? "Working..."}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
