import { CastodiaCard } from "@/components/castodia";

type Props = {
  fullName: string;
  houseName: string | null;
  dob: string | null;
  photoUrl: string | null;
};

export default function ServiceUserHubHeader({
  fullName,
  houseName,
  dob,
  photoUrl,
}: Props) {
  return (
    <CastodiaCard>
      <div className="flex flex-col gap-6 md:flex-row md:items-center">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={fullName}
            className="h-28 w-28 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-28 w-28 items-center justify-center rounded-full bg-slate-100 text-4xl font-bold text-slate-700">
            {fullName.charAt(0)}
          </div>
        )}

        <div>
          <h1 className="text-3xl font-bold text-slate-950">
            {fullName}
          </h1>

          <p className="mt-2 text-slate-500">
            {houseName || "No house assigned"}
          </p>

          {dob && (
            <p className="mt-1 text-sm text-slate-500">
              DOB: {new Date(dob).toLocaleDateString("en-GB")}
            </p>
          )}
        </div>
      </div>
    </CastodiaCard>
  );
}