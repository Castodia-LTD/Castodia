type ContentWidthProps = {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
};

const widths = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-7xl",
  xl: "max-w-screen-2xl",
  full: "max-w-none",
};

export default function ContentWidth({
  children,
  size = "lg",
}: ContentWidthProps) {
  return <div className={`mx-auto w-full ${widths[size]}`}>{children}</div>;
}