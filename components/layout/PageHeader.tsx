import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  children?: ReactNode;
};

export function PageHeader({
  title,
  subtitle,
  children,
}: PageHeaderProps) {
  return (
    <header className="mb-6 flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          {title}
        </h1>

        {subtitle ? (
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-400">
            {subtitle}
          </p>
        ) : null}
      </div>

      {children ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {children}
        </div>
      ) : null}
    </header>
  );
}