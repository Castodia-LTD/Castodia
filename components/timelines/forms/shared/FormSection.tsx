import React from "react";
import { cn, sectionBase } from "./formStyles";

export interface FormSectionProps
  extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
}

export function FormSection({
  title,
  description,
  className,
  children,
  ...props
}: FormSectionProps) {
  return (
    <section
      className={cn(sectionBase, className)}
      {...props}
    >
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-slate-900">
              {title}
            </h3>
          )}

          {description && (
            <p className="mt-1 text-sm text-slate-500">
              {description}
            </p>
          )}
        </div>
      )}

      {children}
    </section>
  );
}