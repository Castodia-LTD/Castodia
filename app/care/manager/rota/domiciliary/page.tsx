import DomiciliaryWorkspace from "@/features/care/manager/rota/DomiciliaryWorkspace";
import DomiciliaryTravelCalculator from "@/features/care/manager/rota/DomiciliaryTravelCalculator";

export default function Page() {
  return (
    <div className="space-y-6">
      <DomiciliaryWorkspace />
      <DomiciliaryTravelCalculator />
    </div>
  );
}
