import React from "react";
import { cn, controlBase } from "./formStyles";

export interface FormTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const FormTextarea = React.forwardRef<
  HTMLTextAreaElement,
  FormTextareaProps
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(controlBase, "min-h-28 resize-y", className)}
      {...props}
    />
  );
});

FormTextarea.displayName = "FormTextarea";