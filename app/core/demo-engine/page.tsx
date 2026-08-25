import DemoEngineRunner from "@/components/core/DemoEngineRunner";

export default function DemoEnginePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Demo Engine
        </h1>

        <p className="mt-1 text-sm text-slate-600">
          Generate and refresh Castodia demonstration data.
        </p>
      </div>

      <DemoEngineRunner />
    </div>
  );
}