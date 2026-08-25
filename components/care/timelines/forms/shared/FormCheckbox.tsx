import React from "react";
import { cn } from "./formStyles";

export interface FormCheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: React.ReactNode;
  description?: string;
}

export const FormCheckbox = React.forwardRef<
  HTMLInputElement,
  FormCheckboxProps
>(
  (
    {
      id,
      label,
      description,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const checkboxId = id ?? React.useId();

    return (
      <label
        htmlFor={checkboxId}
        className={cn(
          "flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 transition",
          "hover:border-slate-300 hover:bg-slate-50",
          "focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20",
          disabled && "cursor-not-allowed opacity-60",
          className
        )}
      >
        <input
          ref={ref}
          id={checkboxId}
          type="checkbox"
          disabled={disabled}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
          {...props}
        />

        <span className="min-w-0">
          <span className="block text-sm font-medium text-slate-800">
            {label}
          </span>

          {description && (
            <span className="mt-1 block text-sm text-slate-500">
              {description}
            </span>
          )}
        </span>
      </label>
    );
  }
);

FormCheckbox.displayName = "FormCheckbox";