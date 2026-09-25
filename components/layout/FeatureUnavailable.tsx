import { LockKeyhole } from "lucide-react";

type Props = {
  featureName: string;
};

export function FeatureUnavailable({ featureName }: Props) {
  return (
    <div className="mx-auto flex min-h-[420px] max-w-2xl items-center justify-center py-10">
      <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
          <LockKeyhole size={24} aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-slate-950">
          {featureName} is not enabled
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600">
          This feature has been switched off for your organisation in
          CastodiaCore. Contact your Castodia administrator if you need access.
        </p>
      </div>
    </div>
  );
}
