import { CastodiaBadge } from "@/components/castodia";
import type { TrainingStatus } from "@/lib/care/training/types";
import {
  getTrainingStatusLabel,
  getTrainingStatusVariant,
} from "@/lib/care/training/utils";

type TrainingStatusBadgeProps = {
  status: TrainingStatus;
};

export default function TrainingStatusBadge({
  status,
}: TrainingStatusBadgeProps) {
  return (
    <CastodiaBadge
      variant={getTrainingStatusVariant(status)}
    >
      {getTrainingStatusLabel(status)}
    </CastodiaBadge>
  );
}