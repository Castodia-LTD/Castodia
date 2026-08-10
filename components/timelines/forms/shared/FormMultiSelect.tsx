import React from "react";

import { FormField } from "./FormField";
import { FormOptionCard } from "./FormOptionCard";
import { cn } from "./formStyles";

export type FormMultiSelectOption<T extends string = string> = {
  value: T;
  label: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
};

export interface FormMultiSelectProps<T extends string = string> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  value: T[];
  options: FormMultiSelectOption<T>[];
  onChange: (value: T[]) => void;
  required?: boolean;
  disabled?: boolean;
  error?: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  minSelected?: number;
  maxSelected?: number;
  className?: string;
}

export function FormMultiSelect<T extends string = string>({
  label,
  description,
  value,
  options,
  onChange,
  required = false,
  disabled = false,
  error,
  columns = 2,
  minSelected,
  maxSelected,
  className,
}: FormMultiSelectProps<T>) {
  const gridColumns = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  }[columns];

  function toggleOption(optionValue: T) {
    const selected = value.includes(optionValue);

    if (selected) {
      if (minSelected !== undefined && value.length <= minSelected) {
        return;
      }

      onChange(value.filter((item) => item !== optionValue));
      return;
    }

    if (maxSelected !== undefined && value.length >= maxSelected) {
      return;
    }

    onChange([...value, optionValue]);
  }

  return (
    <FormField
      label={label}
      description={description}
      required={required}
      error={error}
      className={className}
    >
      <div
        role="group"
        aria-label={typeof label === "string" ? label : undefined}
        className={cn("grid gap-3", gridColumns)}
      >
        {options.map((option) => {
          const selected = value.includes(option.value);

          const selectionLimitReached =
            !selected &&
            maxSelected !== undefined &&
            value.length >= maxSelected;

          return (
            <FormOptionCard
              key={option.value}
              type="button"
              title={option.label}
              description={option.description}
              selected={selected}
              disabled={
                disabled ||
                option.disabled ||
                selectionLimitReached
              }
              aria-pressed={selected}
              onClick={() => toggleOption(option.value)}
              className="min-h-12"
            />
          );
        })}
      </div>
    </FormField>
  );
}