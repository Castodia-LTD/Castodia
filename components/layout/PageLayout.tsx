import type { ReactNode } from "react";

type PageLayoutWidth = "standard" | "wide" | "full";

type PageLayoutProps = {
  children: ReactNode;
  breadcrumbs?: ReactNode;
  header?: ReactNode;
  actions?: ReactNode;
  width?: PageLayoutWidth;
  className?: string;
  contentClassName?: string;
};

const widthClasses: Record<PageLayoutWidth, string> = {
  standard: "max-w-5xl",
  wide: "max-w-7xl",
  full: "max-w-none",
};

export function PageLayout({
  children,
  breadcrumbs,
  header,
  actions,
  width = "wide",
  className = "",
  contentClassName = "",
}: PageLayoutProps) {
  return (
    <div
      className={[
        "min-h-full bg-slate-50",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={[
          "mx-auto w-full px-4 py-5",
          "sm:px-6 sm:py-6",
          "lg:px-8 lg:py-8",
          widthClasses[width],
        ].join(" ")}
      >
        {breadcrumbs ? (
          <div className="mb-4">{breadcrumbs}</div>
        ) : null}

        {header || actions ? (
          <div
            className={[
              "mb-6 flex flex-col gap-4",
              "sm:flex-row sm:items-start sm:justify-between",
            ].join(" ")}
          >
            {header ? (
              <div className="min-w-0 flex-1">{header}</div>
            ) : null}

            {actions ? (
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {actions}
              </div>
            ) : null}
          </div>
        ) : null}

        <main
          className={[
            "min-w-0",
            contentClassName,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {children}
        </main>
      </div>
    </div>
  );
}