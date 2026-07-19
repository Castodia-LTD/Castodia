import Image from "next/image";
import { CalendarDays, Home, Star } from "lucide-react";

type ServiceUserHeroProps = {
  fullName: string;
  preferredName?: string | null;
  photoUrl?: string | null;
  houseName?: string | null;
  dateOfBirth?: string | null;
};

function getInitials(fullName: string) {
  const names = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (names.length === 0) {
    return "?";
  }

  if (names.length === 1) {
    return names[0].slice(0, 2).toUpperCase();
  }

  return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
}

function formatDateOfBirth(value?: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function ServiceUserHero({
  fullName,
  preferredName,
  photoUrl,
  houseName,
  dateOfBirth,
}: ServiceUserHeroProps) {
  const initials = getInitials(fullName);
  const formattedDateOfBirth = formatDateOfBirth(dateOfBirth);

  const showPreferredName =
    preferredName &&
    preferredName.trim().toLowerCase() !==
      fullName.trim().toLowerCase();

  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-cyan-100 bg-gradient-to-r from-cyan-50 via-white to-sky-50 shadow-sm">
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
        {/* Photo or initials */}
        <div className="relative h-20 w-20 shrink-0 self-center overflow-hidden rounded-full border-4 border-white bg-cyan-100 shadow-sm sm:self-auto">
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={`${fullName}'s profile photo`}
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-cyan-100 text-xl font-bold text-cyan-700">
              {initials}
            </div>
          )}
        </div>

        {/* Identity */}
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <h1 className="truncate text-2xl font-bold text-slate-900 sm:text-3xl">
            {fullName}
          </h1>

          <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
            {houseName && (
              <div className="inline-flex min-w-0 items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-sm text-slate-700">
                <Home className="h-4 w-4 shrink-0 text-cyan-600" />

                <span className="truncate">{houseName}</span>
              </div>
            )}

            {formattedDateOfBirth && (
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-sm text-slate-700">
                <CalendarDays className="h-4 w-4 shrink-0 text-cyan-600" />

                <span>DOB: {formattedDateOfBirth}</span>
              </div>
            )}

            {showPreferredName && (
              <div className="inline-flex min-w-0 items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-sm text-slate-700">
                <Star className="h-4 w-4 shrink-0 text-cyan-600" />

                <span className="truncate">
                  Prefers: {preferredName}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}