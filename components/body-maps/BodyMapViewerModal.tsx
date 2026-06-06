"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type BodyView = "front" | "back";

type BodyMap = {
  id: string;
};

type BodyMapMarker = {
  id: string;
  marker_number: number;
  body_view: BodyView;
  x_position: number;
  y_position: number;
  body_area: string | null;
  injury_type: string | null;
  description: string | null;
  action_taken: string | null;
};

type Props = {
  timelineEntryId: string;
  serviceUserGender?: string | null;
  onClose: () => void;
};

export default function BodyMapViewerModal({
  timelineEntryId,
  serviceUserGender,
  onClose,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [bodyMap, setBodyMap] = useState<BodyMap | null>(null);
  const [markers, setMarkers] = useState<BodyMapMarker[]>([]);
  const [selectedView, setSelectedView] = useState<BodyView>("front");
  const [selectedMarker, setSelectedMarker] = useState<BodyMapMarker | null>(
    null
  );

  const bodyMapGender = serviceUserGender === "Female" ? "female" : "male";

  const visibleMarkers = markers.filter(
    (marker) => marker.body_view === selectedView
  );

  async function loadBodyMap() {
    setLoading(true);

    const { data: mapData, error: mapError } = await supabase
      .from("body_maps")
      .select("id")
      .eq("timeline_entry_id", timelineEntryId)
      .maybeSingle();

   if (mapError) {
  alert(mapError.message);
  setLoading(false);
  return;
}

if (!mapData) {
  alert("No body map is linked to this timeline entry.");
  setLoading(false);
  return;
}

    const { data: markerData, error: markerError } = await supabase
      .from("body_map_markers")
      .select(`
        id,
        marker_number,
        body_view,
        x_position,
        y_position,
        body_area,
        injury_type,
        description,
        action_taken
      `)
      .eq("body_map_id", mapData.id)
      .order("marker_number", { ascending: true });

    if (markerError) {
      alert(markerError.message);
      setLoading(false);
      return;
    }

    setBodyMap(mapData);
    setMarkers(markerData || []);
    setSelectedMarker(markerData?.[0] || null);
    setLoading(false);
  }

  useEffect(() => {
    loadBodyMap();
  }, [timelineEntryId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-950 p-5 text-white shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Body Map</h2>
            <p className="text-sm text-slate-400">
              View recorded injury markers and details.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold"
          >
            Close
          </button>
        </div>

        {loading && <p className="mt-6 text-slate-400">Loading body map...</p>}

        {!loading && bodyMap && (
          <div className="mt-5 space-y-5">
            <div className="grid grid-cols-2 gap-2">
              {(["front", "back"] as BodyView[]).map((view) => (
                <button
                  key={view}
                  type="button"
                  onClick={() => {
                    setSelectedView(view);
                    setSelectedMarker(null);
                  }}
                  className={`rounded-xl border p-3 text-sm font-semibold capitalize ${
                    selectedView === view
                      ? "border-cyan-300 bg-cyan-500/20 text-cyan-100"
                      : "border-white/10 bg-white/5 text-slate-300"
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900 p-3">
              <div className="relative mx-auto max-w-sm select-none">
                <img
                  src={`/bodymaps/${bodyMapGender}-${selectedView}.png`}
                  alt={`${bodyMapGender} body map ${selectedView}`}
                  className="block w-full rounded-lg"
                  draggable={false}
                />

                {visibleMarkers.map((marker) => (
                  <button
                    key={marker.id}
                    type="button"
                    onClick={() => setSelectedMarker(marker)}
                    className="absolute flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white shadow-md ring-2 ring-white"
                    style={{
                      left: `${marker.x_position}%`,
                      top: `${marker.y_position}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                    title={`Marker ${marker.marker_number}`}
                  >
                    {marker.marker_number}
                  </button>
                ))}
              </div>
            </div>

            {selectedMarker && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h3 className="font-bold text-cyan-200">
                  Marker {selectedMarker.marker_number}
                </h3>

                <div className="mt-3 space-y-2 text-sm text-slate-200">
                  <p>
                    <span className="font-semibold text-white">Body area:</span>{" "}
                    {selectedMarker.body_area || "Not recorded"}
                  </p>

                  <p>
                    <span className="font-semibold text-white">
                      Injury type:
                    </span>{" "}
                    {selectedMarker.injury_type || "Not recorded"}
                  </p>

                  <p>
                    <span className="font-semibold text-white">
                      Description:
                    </span>{" "}
                    {selectedMarker.description || "Not recorded"}
                  </p>

                  <p>
                    <span className="font-semibold text-white">
                      Action taken:
                    </span>{" "}
                    {selectedMarker.action_taken || "Not recorded"}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}