import type { ReactNode } from "react";
import { castodiaTheme } from "./theme";

type CastodiaPageShellProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  maxWidth?: "default" | "wide" | "full";
};

export default function CastodiaPageShell({
  title,
  description,
  actions,
  children,
  maxWidth = "default",
}: CastodiaPageShellProps) {
  const maxWidthClass =
    maxWidth === "full"
      ? "max-w-none"
      : maxWidth === "wide"
        ? "max-w-[1600px]"
        : "max-w-7xl";

  return (
    <main
  className={`${castodiaTheme.shell.workspace} flex-1 min-h-screen`}>
      <div
        className={`mx-auto w-full ${maxWidthClass} px-4 py-6 sm:px-6 lg:px-8`}
      >
        <header className={castodiaTheme.page.header}>
          <div>
            <h1 className={castodiaTheme.page.title}>{title}</h1>

            {description && (
              <p className={castodiaTheme.page.description}>{description}</p>
            )}
          </div>

          {actions && (
            <div className="flex flex-wrap items-center gap-3">{actions}</div>
          )}
        </header>

        <div className="space-y-6">{children}</div>
      </div>
    </main>
  );
}