import type { ReactNode } from "react";

type CastodiaSectionProps = {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export default function CastodiaSection({
  title,
  description,
  actions,
  children,
}: CastodiaSectionProps) {
  return (
    <section className="space-y-4">
      {(title || description || actions) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {title && (
              <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
            )}

            {description && (
              <p className="mt-1 text-sm leading-6 text-slate-500">
                {description}
              </p>
            )}
          </div>

          {actions && (
            <div className="flex flex-wrap items-center gap-3">{actions}</div>
          )}
        </div>
      )}

      {children}
    </section>
  );
}