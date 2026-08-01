import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type PageBreadcrumbItem = {
  label: string;
  href?: string;
};

type PageBreadcrumbsProps = {
  items: PageBreadcrumbItem[];
};

export function PageBreadcrumbs({
  items,
}: PageBreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-slate-500">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li
              key={`${item.label}-${index}`}
              className="flex min-w-0 items-center gap-1"
            >
              {index > 0 ? (
                <ChevronRight
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-slate-400"
                />
              ) : null}

              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="truncate rounded-sm transition-colors hover:text-cyan-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={
                    isLast
                      ? "truncate font-medium text-slate-700"
                      : "truncate"
                  }
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}