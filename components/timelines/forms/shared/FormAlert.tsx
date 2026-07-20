import React from "react";
import { cn } from "./formStyles";

export type FormAlertVariant =
  | "info"
  | "success"
  | "warning"
  | "error";

export interface FormAlertProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: FormAlertVariant;
  title?: string;
}

export function FormAlert({
  variant = "info",
  title,
  className,
  children,
  ...props
}: FormAlertProps) {
  const variants: Record<FormAlertVariant, string> = {
    info: "border-cyan-200 bg-cyan-50 text-cyan-900",
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
    error: "border-rose-200 bg-rose-50 text-rose-900",
  };

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        "rounded-xl border px-4 py-3 text-sm",
        variants[variant],
        className
      )}
      {...props}
    >
      {title && (
        <p className="font-semibold">
          {title}
        </p>
      )}

      <div className={cn(title && "mt-1")}>
        {children}
      </div>
    </div>
  );
}