type SectionCardProps = {
  children: React.ReactNode;
  className?: string;
};

export default function SectionCard({
  children,
  className = "",
}: SectionCardProps) {
  return (
    <section
      className={`rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-sm sm:p-6 ${className}`}
    >
      {children}
    </section>
  );
}