import {
  BriefcaseBusiness,
  CalendarDays,
  Clock3,
  FileCheck2,
  HeartPulse,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { CastodiaCard } from "@/components/castodia";
import type {
  EmploymentManager,
  StaffEmployment,
} from "@/lib/employment/types";
import {
  formatEmploymentDate,
  getContractTypeLabel,
  getDbsLevelLabel,
  getDbsStatusLabel,
  getOccupationalHealthLabel,
  getRightToWorkLabel,
} from "@/lib/employment/utils";

type EmploymentSummaryProps = {
  employment: StaffEmployment;
  managers: EmploymentManager[];
};

type SummaryFieldProps = {
  label: string;
  value: string;
};

function SummaryField({
  label,
  value,
}: SummaryFieldProps) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </dt>

      <dd className="mt-1 text-sm font-medium text-slate-900">
        {value}
      </dd>
    </div>
  );
}

export default function EmploymentSummary({
  employment,
  managers,
}: EmploymentSummaryProps) {
  const managerName =
    managers.find(
      (manager) => manager.id === employment.manager_id
    )?.full_name ?? "Not assigned";

  return (
    <div className="space-y-6">
      <CastodiaCard>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-700">
            <BriefcaseBusiness className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-950">
              Employment details
            </h2>

            <p className="text-sm text-slate-500">
              Role, contract and workplace information.
            </p>
          </div>
        </div>

        <dl className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryField
            label="Job title"
            value={employment.job_title || "Not recorded"}
          />

          <SummaryField
            label="Department"
            value={employment.department || "Not recorded"}
          />

          <SummaryField
            label="House"
            value={employment.house_name || "Not assigned"}
          />

          <SummaryField
            label="Manager"
            value={managerName}
          />

          <SummaryField
            label="Contract"
            value={getContractTypeLabel(
              employment.contract_type
            )}
          />

          <SummaryField
            label="Contracted hours"
            value={
              employment.contracted_hours !== null
                ? `${employment.contracted_hours} hours`
                : "Not recorded"
            }
          />

          <SummaryField
            label="Start date"
            value={formatEmploymentDate(
              employment.start_date
            )}
          />

          <SummaryField
            label="Probation end"
            value={formatEmploymentDate(
              employment.probation_end_date
            )}
          />

          <SummaryField
            label="Employment end"
            value={formatEmploymentDate(
              employment.end_date
            )}
          />
        </dl>
      </CastodiaCard>

      <div className="grid gap-4 xl:grid-cols-2">
        <CastodiaCard>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-700">
              <UserRound className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Contact details
              </h2>

              <p className="text-sm text-slate-500">
                Work and emergency contact information.
              </p>
            </div>
          </div>

          <dl className="mt-6 grid gap-5 sm:grid-cols-2">
            <SummaryField
              label="Work email"
              value={employment.work_email || "Not recorded"}
            />

            <SummaryField
              label="Work phone"
              value={employment.work_phone || "Not recorded"}
            />

            <SummaryField
              label="Emergency contact"
              value={
                employment.emergency_contact_name ||
                "Not recorded"
              }
            />

            <SummaryField
              label="Relationship"
              value={
                employment.emergency_contact_relationship ||
                "Not recorded"
              }
            />

            <SummaryField
              label="Emergency phone"
              value={
                employment.emergency_contact_phone ||
                "Not recorded"
              }
            />
          </dl>
        </CastodiaCard>

        <CastodiaCard>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-700">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Right to Work
              </h2>

              <p className="text-sm text-slate-500">
                Verification and expiry information.
              </p>
            </div>
          </div>

          <dl className="mt-6 grid gap-5 sm:grid-cols-2">
            <SummaryField
              label="Status"
              value={getRightToWorkLabel(
                employment.right_to_work_status
              )}
            />

            <SummaryField
              label="Checked"
              value={formatEmploymentDate(
                employment.right_to_work_checked_at
              )}
            />

            <SummaryField
              label="Expiry date"
              value={formatEmploymentDate(
                employment.right_to_work_expiry_date
              )}
            />
          </dl>
        </CastodiaCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <CastodiaCard>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-700">
              <FileCheck2 className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                DBS
              </h2>

              <p className="text-sm text-slate-500">
                Disclosure and status-check details.
              </p>
            </div>
          </div>

          <dl className="mt-6 grid gap-5 sm:grid-cols-2">
            <SummaryField
              label="Status"
              value={getDbsStatusLabel(
                employment.dbs_status
              )}
            />

            <SummaryField
              label="Level"
              value={getDbsLevelLabel(
                employment.dbs_level
              )}
            />

            <SummaryField
              label="Certificate number"
              value={
                employment.dbs_certificate_number ||
                "Not recorded"
              }
            />

            <SummaryField
              label="Issue date"
              value={formatEmploymentDate(
                employment.dbs_issue_date
              )}
            />

            <SummaryField
              label="Update Service"
              value={
                employment.dbs_update_service
                  ? "Registered"
                  : "Not registered"
              }
            />

            <SummaryField
              label="Last checked"
              value={formatEmploymentDate(
                employment.dbs_last_checked_at
              )}
            />

            <SummaryField
              label="Next check"
              value={formatEmploymentDate(
                employment.dbs_next_check_date
              )}
            />
          </dl>
        </CastodiaCard>

        <CastodiaCard>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-700">
              <HeartPulse className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Occupational health
              </h2>

              <p className="text-sm text-slate-500">
                Clearance and workplace adjustments.
              </p>
            </div>
          </div>

          <dl className="mt-6 grid gap-5 sm:grid-cols-2">
            <SummaryField
              label="Status"
              value={getOccupationalHealthLabel(
                employment.occupational_health_status
              )}
            />

            <SummaryField
              label="Review date"
              value={formatEmploymentDate(
                employment.occupational_health_review_date
              )}
            />
          </dl>

          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Workplace adjustments
            </p>

            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
              {employment.workplace_adjustments ||
                "No workplace adjustments recorded."}
            </p>
          </div>
        </CastodiaCard>
      </div>

      <CastodiaCard>
        <h2 className="text-lg font-semibold text-slate-950">
          Notes
        </h2>

        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
          {employment.notes || "No employment notes recorded."}
        </p>
      </CastodiaCard>
    </div>
  );
}