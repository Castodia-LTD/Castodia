import {
  CastodiaCard,
  CastodiaSection,
} from "@/components/castodia";

type Props = {
  timelineCount: number;
  incidentCount: number;
  sleepCount: number;
  prnCount: number;
  missedMedicationCount: number;
  toiletingCount: number;
  personalCareCount: number;
};

export default function ReportStatsGrid({
  timelineCount,
  incidentCount,
  sleepCount,
  prnCount,
  missedMedicationCount,
  toiletingCount,
  personalCareCount,
}: Props) {
  const stats = [
    { title: "Timeline Entries", value: timelineCount },
    { title: "Incidents", value: incidentCount },
    { title: "Sleep Records", value: sleepCount },
    { title: "PRN Medication", value: prnCount },
    { title: "Missed Medication", value: missedMedicationCount },
    { title: "Toileting Records", value: toiletingCount },
    { title: "Personal Care", value: personalCareCount },
  ];

  return (
    <CastodiaSection title="Monthly Overview">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <CastodiaCard key={stat.title} padding="md">
            <p className="text-sm text-slate-500">{stat.title}</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">
              {stat.value}
            </p>
          </CastodiaCard>
        ))}
      </div>
    </CastodiaSection>
  );
}