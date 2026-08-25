import React from "react";
import { cn } from "./formStyles";

export interface FormButtonGroupProps
  extends React.HTMLAttributes<HTMLDivElement> {
  align?: "left" | "center" | "right" | "between";
}

export function FormButtonGroup({
  align = "right",
  className,
  children,
  ...props
}: FormButtonGroupProps) {
  const alignment = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
    between: "justify-between",
  };

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 pt-4",
        alignment[align],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}