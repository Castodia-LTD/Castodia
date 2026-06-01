import {
  Activity,
  AlertTriangle,
  ClipboardList,
  Moon,
  Pill,
  Soup,
  Toilet,
  UserRound,
  Utensils,
  HeartPulse,
} from "lucide-react";

export function getEntryStyle(type: string) {
  switch (type) {
    case "Medication":
      return {
        icon: Pill,
        accent: "from-blue-500 to-cyan-400",
        border: "border-blue-400/30",
        text: "text-blue-200",
      };

    case "Personal Care":
      return {
        icon: Soup,
        accent: "from-pink-500 to-rose-400",
        border: "border-pink-400/30",
        text: "text-pink-200",
      };

    case "Food / Fluid":
      return {
        icon: Utensils,
        accent: "from-emerald-500 to-teal-400",
        border: "border-emerald-400/30",
        text: "text-emerald-200",
      };

    case "Toileting":
      return {
        icon: Toilet,
        accent: "from-sky-500 to-blue-400",
        border: "border-sky-400/30",
        text: "text-sky-200",
      };

    case "Behaviour":
      return {
        icon: UserRound,
        accent: "from-purple-500 to-fuchsia-400",
        border: "border-purple-400/30",
        text: "text-purple-200",
      };

    case "Incident":
      return {
        icon: AlertTriangle,
        accent: "from-red-500 to-orange-400",
        border: "border-red-400/30",
        text: "text-red-200",
      };

    case "Sleep":
      return {
        icon: Moon,
        accent: "from-indigo-500 to-violet-400",
        border: "border-indigo-400/30",
        text: "text-indigo-200",
      };

    case "Body Map":
      return {
        icon: ClipboardList,
        accent: "from-amber-500 to-yellow-400",
        border: "border-amber-400/30",
        text: "text-amber-200",
      };

    case "Wellbeing":
      return {
        icon: HeartPulse,
        accent: "from-emerald-500 to-green-400",
        border: "border-emerald-400/30",
        text: "text-emerald-200",
      };

    default:
      return {
        icon: Activity,
        accent: "from-teal-500 to-blue-400",
        border: "border-teal-400/30",
        text: "text-teal-200",
      };
  }
}