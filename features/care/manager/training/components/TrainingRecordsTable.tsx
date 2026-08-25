"use client";

import {
  Eye,
  Trash2,
} from "lucide-react";

import {
  CastodiaButton,
  CastodiaCard,
} from "@/components/castodia";
import type {
  TrainingRecord,
  TrainingStaffMember,
} from "@/lib/care/training/types";
import {
  formatTrainingDate,
  getTrainingStatus,
} from "@/lib/care/training/utils";

import TrainingStatusBadge from "./TrainingStatusBadge";

type TrainingRecordsTableProps = {
  records: TrainingRecord[];
  staff: TrainingStaffMember[];
  onViewCertificate: (
    record: TrainingRecord
  ) => void | Promise<void>;
  onDeleteRecord: (
    record: TrainingRecord
  ) => void | Promise<void>;
};

export default function TrainingRecordsTable({
  records,
  staff,
  onViewCertificate,
  onDeleteRecord,
}: TrainingRecordsTableProps) {
  const staffNameMap = new Map(
    staff.map((person) => [
      person.id,
      person.full_name,
    ])
  );

  return (
    <CastodiaCard padding="none">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1050px] text-left">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Course
              </th>

              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Staff member
              </th>

              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Completed
              </th>

              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Expires
              </th>

              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Provider
              </th>

              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </th>

              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Certificate
              </th>

              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {records.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-12 text-center text-sm text-slate-500"
                >
                  No matching training records.
                </td>
              </tr>
            ) : (
              records.map((record) => {
                const status = getTrainingStatus(
                  record.expiry_date
                );

                return (
                  <tr
                    key={record.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-950">
                        {record.course_name}
                      </p>

                      {record.notes ? (
                        <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                          {record.notes}
                        </p>
                      ) : null}
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-700">
                      {staffNameMap.get(
                        record.staff_id
                      ) ?? "Unknown staff member"}
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-700">
                      {formatTrainingDate(
                        record.completion_date
                      )}
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-700">
                      {formatTrainingDate(
                        record.expiry_date
                      )}
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-700">
                      {record.provider ||
                        "Not recorded"}
                    </td>

                    <td className="px-4 py-4">
                      <TrainingStatusBadge
                        status={status}
                      />
                    </td>

                    <td className="px-4 py-4">
                      {record.certificate_storage_path ? (
                        <CastodiaButton
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            void onViewCertificate(
                              record
                            )
                          }
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </CastodiaButton>
                      ) : (
                        <span className="text-sm text-slate-400">
                          Missing
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-right">
                      <CastodiaButton
                        variant="danger"
                        size="sm"
                        onClick={() =>
                          void onDeleteRecord(record)
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </CastodiaButton>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </CastodiaCard>
  );
}