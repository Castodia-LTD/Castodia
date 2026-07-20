import React from "react";
import { cn, controlBase } from "./formStyles";

export interface FormSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  placeholder?: string;
}

export const FormSelect = React.forwardRef<
  HTMLSelectElement,
  FormSelectProps
>(({ className, children, placeholder, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={cn(controlBase, className)}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}

      {children}
    </select>
  );
});

FormSelect.displayName = "FormSelect";