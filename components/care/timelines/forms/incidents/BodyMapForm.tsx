"use client";

import BodyMapCanvas from "@/components/care/body-maps/BodyMapCanvas";

type Marker = {
  markerNumber: number;
  bodyView: "front" | "back";
  xPosition: number;
  yPosition: number;

  bodyArea: string;
  injuryType: string;
  description: string;
  actionTaken: string;
};

type Props = {
  bodyMapMarkers: Marker[];
  setBodyMapMarkers: (markers: Marker[]) => void;

  bodyMapNotes: string;
  setBodyMapNotes: (value: string) => void;

  serviceUserGender?: string | null;
};

export default function BodyMapForm({
  bodyMapMarkers,
  setBodyMapMarkers,
  bodyMapNotes,
  setBodyMapNotes,
  serviceUserGender,
}: Props) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">
          Body Map
        </h3>

        <p className="text-sm text-slate-600">
          Record injuries, bruising, marks or other observations using a body map.
        </p>
      </div>

      <BodyMapCanvas
  markers={bodyMapMarkers}
  setMarkers={setBodyMapMarkers}
  serviceUserGender={serviceUserGender}
/>
      <div>
        <label className="block text-sm font-medium text-slate-800 mb-2">
          Additional Notes
        </label>

        <textarea
          className="w-full rounded-lg border p-3 text-sm"
          rows={4}
          value={bodyMapNotes}
          onChange={(e) => setBodyMapNotes(e.target.value)}
          placeholder="Add any additional information..."
        />
      </div>
    </div>
  );
}