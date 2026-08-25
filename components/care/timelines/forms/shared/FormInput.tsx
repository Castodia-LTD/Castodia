import React from "react";
import { cn, controlBase } from "./formStyles";

export interface FormInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(controlBase, className)}
        {...props}
      />
    );
  }
);

FormInput.displayName = "FormInput";