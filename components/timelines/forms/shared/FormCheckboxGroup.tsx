import React from "react";
import { cn } from "./formStyles";

export interface FormCheckboxGroupProps
  extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
}

export function FormCheckboxGroup({
  title,
  description,
  className,
  children,
  ...props
}: FormCheckboxGroupProps) {
  return (
    <div className={cn("space-y-3", className)} {...props}>
      {(title || description) && (
        <div>
          {title && (
            <h4 className="text-sm font-semibold text-slate-800">
              {title}
            </h4>
          )}

          {description && (
            <p className="mt-1 text-sm text-slate-500">
              {description}
            </p>
          )}
        </div>
      )}

      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}