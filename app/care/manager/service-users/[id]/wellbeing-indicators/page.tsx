import WellbeingIndicatorManager from "@/components/care/wellbeing/WellbeingIndicatorManager";
import { CastodiaCard } from "@/components/castodia";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function WellbeingIndicatorsPage({
  params,
}: Props) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <CastodiaCard>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-950">
            Wellbeing Indicators
          </h2>

          <p className="text-sm text-slate-600">
            Add or remove wellbeing indicators specific to this service user.
            Active indicators will be available when staff record wellbeing
            observations.
          </p>
        </div>
      </CastodiaCard>

      <CastodiaCard>
        <WellbeingIndicatorManager serviceUserId={id} />
      </CastodiaCard>
    </div>
  );
}