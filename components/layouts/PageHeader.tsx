type PageHeaderProps = {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
};

export default function PageHeader({
  title,
  subtitle,
  children,
}: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          {title}
        </h1>

        {subtitle ? (
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
        ) : null}
      </div>

      {children ? <div className="shrink-0">{children}</div> : null}
    </div>
  );
}