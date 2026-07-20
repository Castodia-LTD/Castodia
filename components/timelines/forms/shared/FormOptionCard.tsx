import React from "react";
import {
  cn,
  optionBase,
  selectedOptionBase,
  unselectedOptionBase,
} from "./formStyles";

export interface FormOptionCardProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "title"
  > {
  selected?: boolean;
  title: React.ReactNode;
  description?: React.ReactNode;
}

export function FormOptionCard({
  selected = false,
  title,
  description,
  className,
  disabled,
  type = "button",
  ...props
}: FormOptionCardProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        optionBase,
        selected ? selectedOptionBase : unselectedOptionBase,
        className
      )}
      {...props}
    >
      <span className="block font-medium">
        {title}
      </span>

      {description && (
        <span
          className={cn(
            "mt-1 block text-sm",
            selected ? "text-cyan-600" : "text-slate-500"
          )}
        >
          {description}
        </span>
      )}
    </button>
  );
}