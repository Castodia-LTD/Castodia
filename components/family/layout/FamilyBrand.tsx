import Image from "next/image";
import Link from "next/link";

export function FamilyBrand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/family" aria-label="CastodiaFamily home" className="inline-flex items-center">
      <Image
        src="/castodia-family-logo.png"
        alt="CastodiaFamily"
        width={1254}
        height={387}
        priority
        className={["h-auto object-contain object-left", compact ? "w-[155px]" : "w-[195px]"].join(" ")}
      />
    </Link>
  );
}
