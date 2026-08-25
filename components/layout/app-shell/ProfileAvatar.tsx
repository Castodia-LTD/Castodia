"use client";

import Image from "next/image";

type ProfileAvatarProps = {
  photoUrl: string | null;
  name: string;
  initials: string;
  size: "small" | "large";
};

export function ProfileAvatar({
  photoUrl,
  name,
  initials,
  size,
}: ProfileAvatarProps) {
  const isLarge =
    size === "large";

  return (
    <div
      className={[
        "relative flex shrink-0 items-center justify-center overflow-hidden",
        "rounded-full border-2 border-teal-500",
        "bg-gradient-to-br from-teal-500 to-cyan-400",
        isLarge
          ? "h-12 w-12"
          : "h-10 w-10",
      ].join(" ")}
    >
      {photoUrl ? (
        <Image
          src={photoUrl}
          alt={
            name
              ? `${name}'s profile photo`
              : "Profile photo"
          }
          fill
          sizes={
            isLarge
              ? "48px"
              : "40px"
          }
          className="object-cover"
        />
      ) : (
        <span
          className={[
            "font-bold text-white",
            isLarge
              ? "text-sm"
              : "text-xs",
          ].join(" ")}
        >
          {initials}
        </span>
      )}
    </div>
  );
}