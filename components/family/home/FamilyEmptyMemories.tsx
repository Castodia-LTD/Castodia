import {
  Heart,
  ImageIcon,
} from "lucide-react";

type FamilyEmptyMemoriesProps = {
  serviceUserName: string;
  compact?: boolean;
  title?: string;
};

export default function FamilyEmptyMemories({
  serviceUserName,
  compact = false,
  title,
}: FamilyEmptyMemoriesProps) {
  if (compact) {
    return (
      <div className="flex min-h-[150px] items-center justify-center rounded-[24px] border border-[#ddd8cd] bg-white/45 px-6 py-7 text-center shadow-[0_10px_30px_rgba(74,65,51,0.04)] backdrop-blur-xl">
        <div>
          <ImageIcon
            className="mx-auto text-[#9aa594]"
            size={25}
            strokeWidth={1.6}
          />

          <p className="mt-3 text-sm font-semibold text-[#4c5b4e]">
            {title ??
              "Nothing shared here yet"}
          </p>

          <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-[#817a70]">
            New memories will appear
            here when the team shares
            them.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-[30px] border border-white/70 bg-white/55 px-6 py-12 text-center shadow-[0_18px_55px_rgba(73,66,54,0.06)] backdrop-blur-xl sm:px-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-12 -left-8 h-36 w-36 rounded-full bg-[#dfe4d7]/50 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#dfcbb4]/30 blur-3xl"
      />

      <div className="relative">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] border border-[#ccd6c7] bg-[#e8ede4] text-[#61745f] shadow-sm">
          <ImageIcon
            size={26}
            strokeWidth={1.6}
          />
        </div>

        <h2 className="mt-5 text-xl font-semibold tracking-[-0.025em] text-[#3c4a40]">
          {title ??
            `${serviceUserName}'s memories will appear here`}
        </h2>

        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#766f65]">
          When the support team shares
          moments from{" "}
          {serviceUserName}&apos;s day,
          you&apos;ll be able to enjoy
          them here.
        </p>

        <div className="mt-5 inline-flex items-center gap-2 text-xs font-medium text-[#9a8069]">
          <Heart
            size={14}
            strokeWidth={1.8}
          />

          Shared with care
        </div>
      </div>
    </div>
  );
}