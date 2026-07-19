import type { ReactNode } from "react";
import {
  CircleUserRound,
  ClipboardList,
  Heart,
  MessageCircle,
  TriangleAlert,
  Info,
} from "lucide-react";

type AboutMeCardProps = {
  title: string;
  children: ReactNode;
  icon?:
    | "person"
    | "clipboard"
    | "heart"
    | "message"
    | "warning"
    | "info";
  accent?: "cyan" | "pink" | "amber" | "blue" | "violet";
  className?: string;
};

const iconMap = {
  person: CircleUserRound,
  clipboard: ClipboardList,
  heart: Heart,
  message: MessageCircle,
  warning: TriangleAlert,
  info: Info,
};

const accentClasses = {
  cyan: "bg-cyan-100 text-cyan-700",
  pink: "bg-pink-100 text-pink-600",
  amber: "bg-amber-100 text-amber-600",
  blue: "bg-sky-100 text-sky-600",
  violet: "bg-violet-100 text-violet-600",
};

export default function AboutMeCard({
  title,
  children,
  icon = "info",
  accent = "cyan",
  className = "",
}: AboutMeCardProps) {
  const Icon = iconMap[icon];

  return (
    <section
      className={`min-w-0 self-start overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      <div className="p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${accentClasses[accent]}`}
          >
            <Icon className="h-5 w-5" />
          </div>

          <h2 className="text-xl font-bold text-slate-900">
            {title}
          </h2>
        </div>

        <div className="min-w-0">
          {children}
        </div>
      </div>
    </section>
  );
}