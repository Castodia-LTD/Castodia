import React from "react";

import { FormField } from "./FormField";
import { FormOptionCard } from "./FormOptionCard";

export type FormYesNoValue = boolean | null;

export interface FormYesNoProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  value: FormYesNoValue;
  onChange: (value: boolean) => void;
  yesLabel?: React.ReactNode;
  noLabel?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  error?: React.ReactNode;
  className?: string;
}

export function FormYesNo({
  label,
  description,
  value,
  onChange,
  yesLabel = "Yes",
  noLabel = "No",
  required = false,
  disabled = false,
  error,
  className,
}: FormYesNoProps) {
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
        className="grid grid-cols-2 gap-3"
      >
        <FormOptionCard
          type="button"
          title={noLabel}
          selected={value === false}
          disabled={disabled}
          onClick={() => onChange(false)}
          className="min-h-12 text-center"
        />

        <FormOptionCard
          type="button"
          title={yesLabel}
          selected={value === true}
          disabled={disabled}
          onClick={() => onChange(true)}
          className="min-h-12 text-center"
        />
      </div>
    </FormField>
  );
}