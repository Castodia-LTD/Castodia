import type { SaveContext } from "../types";
import { saveTimelineEntry } from "../saveTimelineEntry";

export async function saveCommunityAccess(
  ctx: SaveContext
): Promise<boolean> {
  const data = ctx.communityAccessData;

  if (!data) {
    alert("Please complete the Community Access form.");
    return false;
  }

  if (!data.communityType) {
    alert("Please select the type of community access.");
    return false;
  }

  if (
    data.communityType === "Other" &&
    !data.otherCommunityType?.trim()
  ) {
    alert("Please describe the community access type.");
    return false;
  }

  if (!data.placeOrGroupName?.trim()) {
    alert("Please enter the place, service or group.");
    return false;
  }

  if (!data.purpose?.length) {
    alert("Please select at least one purpose.");
    return false;
  }

  if (
    data.purpose.includes("Other") &&
    !data.otherPurpose?.trim()
  ) {
    alert("Please describe the purpose.");
    return false;
  }

  if (!data.attendanceStatus) {
    alert("Please select attendance.");
    return false;
  }

  if (!data.participationLevel) {
    alert("Please select participation level.");
    return false;
  }

  if (!data.outcome?.length) {
    alert("Please select at least one outcome.");
    return false;
  }

  if (
    data.outcome.includes("Other") &&
    !data.otherOutcome?.trim()
  ) {
    alert("Please describe the outcome.");
    return false;
  }

  if (
    data.supportProvided.includes("Other") &&
    !data.otherSupport?.trim()
  ) {
    alert("Please describe the support provided.");
    return false;
  }

  const communityType =
    data.communityType === "Other"
      ? data.otherCommunityType.trim()
      : data.communityType;

  const purposes = data.purpose.map((item: string) =>
    item === "Other" ? data.otherPurpose.trim() : item
  );

  const support = data.supportProvided.map((item: string) =>
    item === "Other" ? data.otherSupport.trim() : item
  );

  const outcomes = data.outcome.map((item: string) =>
    item === "Other" ? data.otherOutcome.trim() : item
  );

  const finalContent = `Community Access

Community Type:
${communityType}

Place / Service / Group:
${data.placeOrGroupName.trim()}

Purpose:
${purposes.map((item: string) => `• ${item}`).join("\n")}

Attendance:
${data.attendanceStatus}

Participation Level:
${data.participationLevel}

Support Provided:
${support.map((item: string) => `• ${item}`).join("\n")}

Outcome:
${outcomes.map((item: string) => `• ${item}`).join("\n")}

Notes:
${data.notes?.trim() || "Not recorded"}`;

  return saveTimelineEntry(ctx, {
    entryType: "Community Access",
    content: finalContent,
  });
}