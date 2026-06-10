import type { HTMLAttributes, ReactNode } from "react";
import { castodiaTheme } from "./theme";

type CastodiaCardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  padding?: "none" | "sm" | "md" | "lg";
  interactive?: boolean;
};

export default function CastodiaCard({
  children,
  padding = "lg",
  interactive = false,
  className = "",
  ...props
}: CastodiaCardProps) {
  return (
    <div
      className={[
        castodiaTheme.card.base,
        castodiaTheme.card.padding[padding],
        interactive ? "transition hover:-translate-y-0.5 hover:shadow-md" : "",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}