import type { LucideIcon } from "lucide-react";
import {
  Footprints,
  AlertTriangle,
  Apple,
  Bed,
  BriefcaseMedical,
  ClipboardList,
  CookingPot,
  Droplets,
  HeartHandshake,
  HeartPulse,
  Home,
  MapPin,
  MessageCircle,
  Pill,
  ShieldAlert,
  Stethoscope,
  Toilet,
  UserRound,
  UsersRound,
} from "lucide-react";

type EntryStyle = {
  icon: LucideIcon;
  accent: string;
  rail: string;
  border: string;
  text: string;
};

const defaultStyle: EntryStyle = {
  icon: ClipboardList,
  accent: "from-slate-500 to-slate-400",
  rail: "bg-slate-500",
  border: "border-slate-400/30",
  text: "text-slate-200",
};

const entryStyles: Record<string, EntryStyle> = {
  Activity: {
    icon: Footprints,
    accent: "from-green-500 to-emerald-400",
    rail: "bg-green-500",
    border: "border-green-400/30",
    text: "text-green-200",
  },

  "Behaviour Incident": {
    icon: AlertTriangle,
    accent: "from-orange-500 to-red-400",
    rail: "bg-orange-500",
    border: "border-orange-400/30",
    text: "text-orange-200",
  },

  "Behaviour Observation": {
    icon: UserRound,
    accent: "from-purple-500 to-fuchsia-400",
    rail: "bg-purple-500",
    border: "border-purple-400/30",
    text: "text-purple-200",
  },

  "Body Map": {
    icon: ClipboardList,
    accent: "from-amber-500 to-yellow-400",
    rail: "bg-amber-500",
    border: "border-amber-400/30",
    text: "text-amber-200",
  },

  "Community Access": {
    icon: MapPin,
    accent: "from-violet-500 to-purple-400",
    rail: "bg-violet-500",
    border: "border-violet-400/30",
    text: "text-violet-200",
  },

  "Contact / Visit": {
    icon: UsersRound,
    accent: "from-cyan-500 to-sky-400",
    rail: "bg-cyan-500",
    border: "border-cyan-400/30",
    text: "text-cyan-200",
  },

  "Health Observation": {
    icon: HeartPulse,
    accent: "from-rose-500 to-pink-400",
    rail: "bg-rose-500",
    border: "border-rose-400/30",
    text: "text-rose-200",
  },

  "Health Professional": {
    icon: Stethoscope,
    accent: "from-blue-600 to-cyan-500",
    rail: "bg-blue-600",
    border: "border-blue-400/30",
    text: "text-blue-200",
  },

  "Household Tasks": {
    icon: Home,
    accent: "from-amber-500 to-orange-400",
    rail: "bg-amber-500",
    border: "border-amber-400/30",
    text: "text-amber-200",
  },

  Incident: {
    icon: ShieldAlert,
    accent: "from-red-600 to-red-400",
    rail: "bg-red-600",
    border: "border-red-400/30",
    text: "text-red-200",
  },

  Medication: {
    icon: Pill,
    accent: "from-blue-500 to-cyan-400",
    rail: "bg-blue-600",
    border: "border-blue-400/30",
    text: "text-blue-200",
  },

  "Medication Error": {
    icon: AlertTriangle,
    accent: "from-red-600 to-orange-500",
    rail: "bg-red-600",
    border: "border-red-400/30",
    text: "text-red-200",
  },

  "Nutrition & Hydration": {
    icon: Apple,
    accent: "from-emerald-500 to-teal-400",
    rail: "bg-emerald-500",
    border: "border-emerald-400/30",
    text: "text-emerald-200",
  },

  "Personal Care": {
    icon: Droplets,
    accent: "from-pink-500 to-rose-400",
    rail: "bg-pink-500",
    border: "border-pink-400/30",
    text: "text-pink-200",
  },

  Sleep: {
    icon: Bed,
    accent: "from-indigo-500 to-violet-400",
    rail: "bg-indigo-500",
    border: "border-indigo-400/30",
    text: "text-indigo-200",
  },

  "Social Interaction": {
    icon: MessageCircle,
    accent: "from-fuchsia-500 to-pink-400",
    rail: "bg-fuchsia-500",
    border: "border-fuchsia-400/30",
    text: "text-fuchsia-200",
  },

  Symptoms: {
    icon: BriefcaseMedical,
    accent: "from-cyan-600 to-teal-500",
    rail: "bg-cyan-600",
    border: "border-cyan-400/30",
    text: "text-cyan-200",
  },

  Toileting: {
    icon: Toilet,
    accent: "from-sky-500 to-blue-400",
    rail: "bg-sky-500",
    border: "border-sky-400/30",
    text: "text-sky-200",
  },

  "Wellbeing Observation": {
    icon: HeartHandshake,
    accent: "from-teal-500 to-emerald-400",
    rail: "bg-teal-500",
    border: "border-teal-400/30",
    text: "text-teal-200",
  },
};

export function getEntryStyle(type: string): EntryStyle {
  return entryStyles[type] ?? defaultStyle;
}