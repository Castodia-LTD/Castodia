"use client";

import BodyMapCanvas from "@/components/care/body-maps/BodyMapCanvas";
import {
  FormField,
  FormSection,
  FormTextarea,
} from "@/components/care/timelines/forms/shared";

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
      <FormSection
        title="Body map"
        description="Add a marker for each injury, bruise, mark or other physical observation."
      >
        <BodyMapCanvas
          markers={bodyMapMarkers}
          setMarkers={setBodyMapMarkers}
          serviceUserGender={serviceUserGender}
        />
      </FormSection>

      {bodyMapMarkers.length > 0 && (
        <FormSection
          title="Additional information"
          description="Optional context that applies to the body map as a whole."
          collapsible
          defaultOpen={false}
          summary={bodyMapNotes ? "Notes added" : `${bodyMapMarkers.length} marker${bodyMapMarkers.length === 1 ? "" : "s"} recorded`}
        >
          <FormField label="Notes">
            <FormTextarea
              rows={4}
              value={bodyMapNotes}
              onChange={(event) => setBodyMapNotes(event.target.value)}
              placeholder="Add any additional information..."
            />
          </FormField>
        </FormSection>
      )}
    </div>
  );
}
