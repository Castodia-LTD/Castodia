import { CastodiaBadge } from "@/components/castodia";
import type { EmploymentStatus } from "@/lib/care/employment/types";
import {
  getEmploymentStatusLabel,
  getEmploymentStatusVariant,
} from "@/lib/care/employment/utils";

type EmploymentStatusBadgeProps = {
  status: EmploymentStatus;
};

export default function EmploymentStatusBadge({
  status,
}: EmploymentStatusBadgeProps) {
  return (
    <CastodiaBadge variant={getEmploymentStatusVariant(status)}>
      {getEmploymentStatusLabel(status)}
    </CastodiaBadge>
  );
}