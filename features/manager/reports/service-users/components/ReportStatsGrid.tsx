import ReportStatCard from "@/components/admin/reports/ReportStatCard";

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
  return (
    <section>
      <h2 className="text-xl font-semibold text-white">Monthly Overview</h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ReportStatCard title="Timeline Entries" value={timelineCount} />
        <ReportStatCard title="Incidents" value={incidentCount} />
        <ReportStatCard title="Sleep Records" value={sleepCount} />
        <ReportStatCard title="PRN Medication" value={prnCount} />
        <ReportStatCard title="Missed Medication" value={missedMedicationCount} />
        <ReportStatCard title="Toileting Records" value={toiletingCount} />
        <ReportStatCard title="Personal Care" value={personalCareCount} />
      </div>
    </section>
  );
}