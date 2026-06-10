import type { ButtonHTMLAttributes } from "react";
import { castodiaTheme } from "./theme";

type CastodiaButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "success" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
};

export default function CastodiaButton({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: CastodiaButtonProps) {
  return (
    <button
      className={[
        castodiaTheme.button.base,
        castodiaTheme.button.sizes[size],
        castodiaTheme.button.variants[variant],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}