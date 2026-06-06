"use client";

import { useState } from "react";

type BodyView = "front" | "back";

type Marker = {
  markerNumber: number;
  bodyView: BodyView;
  xPosition: number;
  yPosition: number;

  bodyArea: string;
  injuryType: string;
  description: string;
  actionTaken: string;
};

type Props = {
  markers: Marker[];
  setMarkers: (markers: Marker[]) => void;
  serviceUserGender?: string | null;
};

const bodyViews: BodyView[] = ["front", "back"];

const injuryTypes = [
  "Bruise",
  "Cut",
  "Graze",
  "Burn / Scald",
  "Redness",
  "Swelling",
  "Pressure Mark",
  "Pain Reported",
  "Other",
];

export default function BodyMapCanvas({
  markers = [],
  setMarkers,
  serviceUserGender,
}: Props) {
  const [selectedView, setSelectedView] = useState<BodyView>("front");
  const [editingMarkerNumber, setEditingMarkerNumber] = useState<number | null>(
    null
  );

  const bodyMapGender = serviceUserGender === "Female" ? "female" : "male";

  const visibleMarkers = markers.filter(
    (marker) => marker.bodyView === selectedView
  );

  const editingMarker =
    editingMarkerNumber === null
      ? null
      : markers.find((marker) => marker.markerNumber === editingMarkerNumber) ||
        null;

  const handleBodyClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();

    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    const newMarker: Marker = {
      markerNumber: markers.length + 1,
      bodyView: selectedView,
      xPosition: Number(x.toFixed(2)),
      yPosition: Number(y.toFixed(2)),
      bodyArea: "",
      injuryType: "",
      description: "",
      actionTaken: "",
    };

    setMarkers([...markers, newMarker]);
    setEditingMarkerNumber(newMarker.markerNumber);
  };

  const updateMarker = (field: keyof Marker, value: string) => {
    if (editingMarkerNumber === null) return;

    setMarkers(
      markers.map((marker) =>
        marker.markerNumber === editingMarkerNumber
          ? {
              ...marker,
              [field]: value,
            }
          : marker
      )
    );
  };

  const removeMarker = (markerNumber: number) => {
    const remaining = markers
      .filter((marker) => marker.markerNumber !== markerNumber)
      .map((marker, index) => ({
        ...marker,
        markerNumber: index + 1,
      }));

    setMarkers(remaining);
    setEditingMarkerNumber(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-800">
          Body view
        </label>

        <div className="grid grid-cols-2 gap-2">
          {bodyViews.map((view) => (
            <button
              key={view}
              type="button"
              onClick={() => setSelectedView(view)}
              className={`rounded-lg border p-3 text-sm font-medium capitalize ${
                selectedView === view
                  ? "border-slate-900 bg-slate-900 text-slate-300"
                  : "border-slate-300 bg-white text-slate-700"
              }`}
            >
              {view}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-900 p-3">
        <div
          className="relative mx-auto max-w-sm cursor-crosshair select-none"
          onClick={handleBodyClick}
        >
          <img
            src={`/bodymaps/${bodyMapGender}-${selectedView}.png`}
            alt={`${bodyMapGender} body map ${selectedView}`}
            className="block w-full rounded-lg"
            draggable={false}
          />

          {visibleMarkers.map((marker) => (
            <button
              key={marker.markerNumber}
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setEditingMarkerNumber(marker.markerNumber);
              }}
              className="absolute flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-slate-300 shadow-md ring-2 ring-white"
              style={{
                left: `${marker.xPosition}%`,
                top: `${marker.yPosition}%`,
                transform: "translate(-50%, -50%)",
              }}
              title={`Marker ${marker.markerNumber}`}
            >
              {marker.markerNumber}
            </button>
          ))}
        </div>

        <p className="mt-3 text-xs text-slate-500">
          Tap the body map to place a numbered marker. Tap a marker to edit its
          injury details.
        </p>
      </div>

      {editingMarker && (
        <div className="space-y-4 rounded-xl border bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h4 className="font-semibold text-slate-900">
                Marker {editingMarker.markerNumber} Details
              </h4>
              <p className="text-xs capitalize text-slate-500">
                {editingMarker.bodyView} view
              </p>
            </div>

            <button
              type="button"
              onClick={() => setEditingMarkerNumber(null)}
              className="rounded-lg border px-3 py-1 text-xs font-medium text-slate-700"
            >
              Done
            </button>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-800">
              Body Area
            </label>
            <input
              className="w-full rounded-lg border border-slate-600 bg-slate-800 p-3 text-sm text-slate-300 placeholder:text-slate-400"
              value={editingMarker.bodyArea}
              onChange={(e) => updateMarker("bodyArea", e.target.value)}
              placeholder="e.g. Right forearm, left knee, lower back..."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-800">
              Injury Type
            </label>
            <select
              className="w-full rounded-lg border border-slate-600 bg-slate-800 p-3 text-sm text-slate-300 placeholder:text-slate-400"
              value={editingMarker.injuryType}
              onChange={(e) => updateMarker("injuryType", e.target.value)}
            >
              <option value="">Select injury type...</option>
              {injuryTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-800">
              Description
            </label>
            <textarea
              className="w-full rounded-lg border border-slate-600 bg-slate-800 p-3 text-sm text-slate-300 placeholder:text-slate-400"
              rows={3}
              value={editingMarker.description}
              onChange={(e) => updateMarker("description", e.target.value)}
              placeholder="Describe what was observed..."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-800">
              Action Taken
            </label>
            <textarea
              className="w-full rounded-lg border border-slate-600 bg-slate-800 p-3 text-sm text-slate-300 placeholder:text-slate-400"
              rows={3}
              value={editingMarker.actionTaken}
              onChange={(e) => updateMarker("actionTaken", e.target.value)}
              placeholder="Record any action taken, monitoring, escalation or advice sought..."
            />
          </div>

          <button
            type="button"
            onClick={() => removeMarker(editingMarker.markerNumber)}
            className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600"
          >
            Remove Marker
          </button>
        </div>
      )}

      {markers.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-800">
            Markers recorded
          </label>

          <div className="space-y-2">
            {markers.map((marker) => (
              <button
                key={marker.markerNumber}
                type="button"
                onClick={() => {
                  setSelectedView(marker.bodyView);
                  setEditingMarkerNumber(marker.markerNumber);
                }}
                className="w-full rounded-lg border p-3 text-left text-sm hover:bg-slate-50"
              >
                <p className="font-medium text-slate-900">
                  Marker {marker.markerNumber}
                  {marker.bodyArea ? ` — ${marker.bodyArea}` : ""}
                </p>
                <p className="text-xs capitalize text-slate-500">
                  {marker.bodyView} view
                  {marker.injuryType ? ` · ${marker.injuryType}` : ""}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}