import Link from "next/link";
import { ChevronLeft, Ellipsis, Pencil } from "lucide-react";

import { CastodiaButton } from "@/components/castodia";

type StaffHubHeaderProps = {
  staffId: string;
};

export default function StaffHubHeader({
  staffId,
}: StaffHubHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <Link
        href="/manager/staff"
        className="inline-flex w-fit items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-950"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to staff
      </Link>

      <Link href={`/manager/staff/${staffId}/edit`}>
  <CastodiaButton variant="secondary">
    <Pencil className="h-4 w-4" />
    Edit details
  </CastodiaButton>
</Link>
    </div>
  );
}