import type { HTMLAttributes, ReactNode } from "react";
import { castodiaTheme } from "./theme";

type CastodiaBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  variant?: "neutral" | "success" | "warning" | "danger" | "info";
};

export default function CastodiaBadge({
  children,
  variant = "neutral",
  className = "",
  ...props
}: CastodiaBadgeProps) {
  return (
    <span
      className={[
        castodiaTheme.badge.base,
        castodiaTheme.badge.variants[variant],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </span>
  );
}