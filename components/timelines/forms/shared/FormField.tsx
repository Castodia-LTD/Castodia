import React from "react";

import { FormLabel } from "./FormLabel";
import { cn } from "./formStyles";

export interface FormFieldProps
  extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode;
  htmlFor?: string;
  description?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  children: React.ReactNode;
}

type AccessibleChildProps = {
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
  "aria-required"?: boolean;
};

export function FormField({
  label,
  htmlFor,
  description,
  error,
  required = false,
  className,
  children,
  ...props
}: FormFieldProps) {
  const generatedDescriptionId = React.useId();
  const generatedErrorId = React.useId();

  const descriptionId = description
    ? `${htmlFor ?? generatedDescriptionId}-description`
    : undefined;

  const errorId = error
    ? `${htmlFor ?? generatedErrorId}-error`
    : undefined;

  const describedBy = [descriptionId, errorId]
    .filter(Boolean)
    .join(" ") || undefined;

  const control = React.isValidElement<AccessibleChildProps>(children)
    ? React.cloneElement(children, {
        "aria-describedby": [
          children.props["aria-describedby"],
          describedBy,
        ]
          .filter(Boolean)
          .join(" ") || undefined,
        "aria-invalid":
          error ? true : children.props["aria-invalid"],
        "aria-required":
          required ? true : children.props["aria-required"],
      })
    : children;

  return (
    <div
      className={cn("space-y-2", className)}
      {...props}
    >
      {(label || description) && (
        <div>
          {label && (
            <FormLabel
              htmlFor={htmlFor}
              required={required}
              className="mb-0"
            >
              {label}
            </FormLabel>
          )}

          {description && (
            <p
              id={descriptionId}
              className="mt-1 text-sm leading-5 text-slate-500"
            >
              {description}
            </p>
          )}
        </div>
      )}

      <div>{control}</div>

      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-sm font-medium text-rose-700"
        >
          {error}
        </p>
      )}
    </div>
  );
}