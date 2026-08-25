import React from "react";
import { cn, labelBase } from "./formStyles";

export interface FormLabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function FormLabel({
  children,
  required = false,
  className,
  ...props
}: FormLabelProps) {
  return (
    <label
      className={cn(labelBase, className)}
      {...props}
    >
      <span className="inline-flex items-center gap-1">
        {children}

        {required && (
          <span
            aria-hidden="true"
            className="text-rose-500"
          >
            *
          </span>
        )}
      </span>
    </label>
  );
}