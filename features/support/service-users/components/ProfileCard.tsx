type ProfileCardProps = {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  content: string | null;
  emptyText: string;
  colour: "cyan" | "red" | "blue" | "amber";
};

export default function ProfileCard({
  icon,
  title,
  subtitle,
  content,
  emptyText,
  colour,
}: ProfileCardProps) {
  const styles = {
    cyan: {
      card: "border-white/10 bg-white/10",
      icon: "bg-cyan-500/20 text-cyan-300",
      title: "text-white",
      subtitle: "text-slate-400",
      text: "text-slate-200",
    },
    red: {
      card: "border-red-500/20 bg-red-500/10",
      icon: "bg-red-500/20 text-red-300",
      title: "text-red-300",
      subtitle: "text-red-200/70",
      text: "text-slate-100",
    },
    blue: {
      card: "border-blue-500/20 bg-blue-500/10",
      icon: "bg-blue-500/20 text-blue-300",
      title: "text-blue-300",
      subtitle: "text-blue-200/70",
      text: "text-slate-100",
    },
    amber: {
      card: "border-amber-500/20 bg-amber-500/10",
      icon: "bg-amber-500/20 text-amber-300",
      title: "text-amber-300",
      subtitle: "text-amber-200/70",
      text: "text-slate-100",
    },
  }[colour];

  return (
    <div
      className={`rounded-3xl border p-6 shadow-xl backdrop-blur ${styles.card}`}
    >
      <div className="flex items-center gap-3">
        <div className={`rounded-2xl p-3 ${styles.icon}`}>{icon}</div>

        <div>
          <h2 className={`text-xl font-bold ${styles.title}`}>{title}</h2>
          <p className={`text-sm ${styles.subtitle}`}>{subtitle}</p>
        </div>
      </div>

      <p className={`mt-5 whitespace-pre-line ${styles.text}`}>
        {content || emptyText}
      </p>
    </div>
  );
}