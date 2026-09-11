"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn, sectionBase } from "./formStyles";

export interface FormSectionProps
  extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
  summary?: string;
}

export function FormSection({
  title,
  description,
  collapsible = false,
  defaultOpen = true,
  summary,
  className,
  children,
  ...props
}: FormSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  if (collapsible) {
    return (
      <section className={cn(sectionBase, className)} {...props}>
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="flex w-full items-start justify-between gap-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
        >
          <div className="min-w-0">
            {title ? (
              <h3 className="text-base font-semibold text-slate-900 sm:text-lg">
                {title}
              </h3>
            ) : null}
            {description ? (
              <p className="mt-1 text-sm leading-5 text-slate-500">
                {description}
              </p>
            ) : null}
            {!open && summary ? (
              <p className="mt-2 truncate text-sm font-medium text-teal-700">
                {summary}
              </p>
            ) : null}
          </div>

          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
            <ChevronDown
              size={18}
              aria-hidden="true"
              className={cn(
                "transition-transform duration-200",
                open && "rotate-180",
              )}
            />
          </span>
        </button>

        {open ? <div className="mt-5 space-y-5">{children}</div> : null}
      </section>
    );
  }

  return (
    <section className={cn(sectionBase, className)} {...props}>
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-base font-semibold text-slate-900 sm:text-lg">
              {title}
            </h3>
          )}

          {description && (
            <p className="mt-1 text-sm leading-5 text-slate-500">
              {description}
            </p>
          )}
        </div>
      )}

      {children}
    </section>
  );
}
