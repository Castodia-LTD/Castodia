import type { ReactNode } from "react";
import { CastodiaCard } from "@/components/castodia";

type ProfileCardProps = {
  icon: ReactNode;
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
      icon: "bg-cyan-50 text-cyan-700",
      title: "text-slate-950",
    },
    red: {
      icon: "bg-red-50 text-red-700",
      title: "text-red-700",
    },
    blue: {
      icon: "bg-blue-50 text-blue-700",
      title: "text-blue-700",
    },
    amber: {
      icon: "bg-amber-50 text-amber-700",
      title: "text-amber-700",
    },
  }[colour];

  return (
    <CastodiaCard>
      <div className="flex items-center gap-3">
        <div className={`rounded-2xl p-3 ${styles.icon}`}>
          {icon}
        </div>

        <div>
          <h2 className={`text-xl font-semibold ${styles.title}`}>
            {title}
          </h2>

          <p className="text-sm text-slate-500">
            {subtitle}
          </p>
        </div>
      </div>

      <p className="mt-5 whitespace-pre-line text-slate-700">
        {content || emptyText}
      </p>
    </CastodiaCard>
  );
}