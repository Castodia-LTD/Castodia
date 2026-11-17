import RotaDirectoryPage from "@/features/care/manager/rota/RotaDirectoryPage";
import DomiciliaryTravelCalculator from "@/features/care/manager/rota/DomiciliaryTravelCalculator";

export default function Page() {
  return (
    <div className="space-y-6">
      <RotaDirectoryPage careModel="domiciliary" />
      <DomiciliaryTravelCalculator />
    </div>
  );
}
