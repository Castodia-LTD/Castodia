import React from "react";

import { FormField } from "./FormField";
import { FormOptionCard } from "./FormOptionCard";
import { cn } from "./formStyles";

export type FormChoiceOption<T extends string = string> = {
  value: T;
  label: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
};

export interface FormChoiceGroupProps<T extends string = string> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  value: T | "";
  options: FormChoiceOption<T>[];
  onChange: (value: T) => void;
  required?: boolean;
  disabled?: boolean;
  error?: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function FormChoiceGroup<T extends string = string>({
  label,
  description,
  value,
  options,
  onChange,
  required = false,
  disabled = false,
  error,
  columns = 2,
  className,
}: FormChoiceGroupProps<T>) {
  const gridColumns = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  }[columns];

  return (
    <FormField
      label={label}
      description={description}
      required={required}
      error={error}
      className={className}
    >
      <div
        role="radiogroup"
        aria-label={typeof label === "string" ? label : undefined}
        className={cn("grid gap-3", gridColumns)}
      >
        {options.map((option) => {
          const selected = value === option.value;

          return (
            <FormOptionCard
              key={option.value}
              type="button"
              title={option.label}
              description={option.description}
              selected={selected}
              disabled={disabled || option.disabled}
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(option.value)}
              className="min-h-12"
            />
          );
        })}
      </div>
    </FormField>
  );
}