import {
  Leaf,
  Sparkles,
} from "lucide-react";

type FamilyWelcomeProps = {
  familyMemberName: string;
  serviceUserName: string;
  relationship: string | null;
};

function getFirstName(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)[0] ||
    "there"
  );
}

function getGreeting() {
  const hour =
    new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 18) {
    return "Good afternoon";
  }

  return "Good evening";
}

export default function FamilyWelcome({
  familyMemberName,
  serviceUserName,
  relationship,
}: FamilyWelcomeProps) {
  const firstName =
    getFirstName(familyMemberName);

  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-4 top-0 h-24 w-24 rounded-full bg-[#dfe5d7]/40 blur-3xl"
      />

      <div className="relative">
        <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-[#7d887c]">
          <Sparkles
            size={15}
            className="text-[#9a8069]"
          />

          <span>
            CastodiaFamily
          </span>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-[-0.035em] text-[#34423b] sm:text-4xl lg:text-[42px]">
            {getGreeting()},{" "}
            {firstName}
          </h1>

          <Leaf
            className="hidden text-[#9caa91] sm:block"
            size={24}
            strokeWidth={1.5}
          />
        </div>

        <p className="mt-3 max-w-2xl text-base leading-7 text-[#756f65]">
          Here are the latest memories
          shared from{" "}
          {serviceUserName}&apos;s
          everyday life.
        </p>

        {relationship ? (
          <p className="mt-2 text-sm text-[#938679]">
            You&apos;re connected as{" "}
            <span className="font-semibold text-[#6a7568]">
              {relationship}
            </span>
            .
          </p>
        ) : null}
      </div>
    </section>
  );
}