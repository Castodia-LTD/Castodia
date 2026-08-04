"use client";

import type {
  EmploymentFormValues,
  EmploymentManager,
} from "@/lib/employment/types";

type EmploymentDetailsFormProps = {
  values: EmploymentFormValues;
  managers: EmploymentManager[];
  disabled?: boolean;
  onChange: (values: EmploymentFormValues) => void;
};

const inputClassName =
  "mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:bg-slate-100";

const textareaClassName =
  "mt-2 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:bg-slate-100";

export default function EmploymentDetailsForm({
  values,
  managers,
  disabled = false,
  onChange,
}: EmploymentDetailsFormProps) {
  function update<K extends keyof EmploymentFormValues>(
    key: K,
    value: EmploymentFormValues[K]
  ) {
    onChange({
      ...values,
      [key]: value,
    });
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold text-slate-950">
          Employment details
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Job title">
            <input
              value={values.job_title}
              onChange={(event) =>
                update("job_title", event.target.value)
              }
              disabled={disabled}
              className={inputClassName}
            />
          </Field>

          <Field label="Department">
            <input
              value={values.department}
              onChange={(event) =>
                update("department", event.target.value)
              }
              disabled={disabled}
              className={inputClassName}
            />
          </Field>

          <Field label="House">
            <input
              value={values.house_name}
              onChange={(event) =>
                update("house_name", event.target.value)
              }
              disabled={disabled}
              className={inputClassName}
            />
          </Field>

          <Field label="Manager">
            <select
              value={values.manager_id}
              onChange={(event) =>
                update("manager_id", event.target.value)
              }
              disabled={disabled}
              className={inputClassName}
            >
              <option value="">Not assigned</option>

              {managers.map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {manager.full_name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Employment status">
            <select
              value={values.employment_status}
              onChange={(event) =>
                update(
                  "employment_status",
                  event.target
                    .value as EmploymentFormValues["employment_status"]
                )
              }
              disabled={disabled}
              className={inputClassName}
            >
              <option value="active">Active</option>
              <option value="probation">Probation</option>
              <option value="suspended">Suspended</option>
              <option value="maternity_leave">
                Maternity leave
              </option>
              <option value="long_term_leave">
                Long-term leave
              </option>
              <option value="left">Left employment</option>
            </select>
          </Field>

          <Field label="Contract type">
            <select
              value={values.contract_type}
              onChange={(event) =>
                update(
                  "contract_type",
                  event.target
                    .value as EmploymentFormValues["contract_type"]
                )
              }
              disabled={disabled}
              className={inputClassName}
            >
              <option value="">Not recorded</option>
              <option value="permanent">Permanent</option>
              <option value="fixed_term">Fixed term</option>
              <option value="zero_hours">Zero hours</option>
              <option value="bank">Bank</option>
              <option value="agency">Agency</option>
              <option value="volunteer">Volunteer</option>
              <option value="other">Other</option>
            </select>
          </Field>

          <Field label="Contracted hours">
            <input
              type="number"
              min="0"
              step="0.25"
              value={values.contracted_hours}
              onChange={(event) =>
                update("contracted_hours", event.target.value)
              }
              disabled={disabled}
              className={inputClassName}
            />
          </Field>

          <Field label="Start date">
            <input
              type="date"
              value={values.start_date}
              onChange={(event) =>
                update("start_date", event.target.value)
              }
              disabled={disabled}
              className={inputClassName}
            />
          </Field>

          <Field label="Probation end date">
            <input
              type="date"
              value={values.probation_end_date}
              onChange={(event) =>
                update("probation_end_date", event.target.value)
              }
              disabled={disabled}
              className={inputClassName}
            />
          </Field>

          <Field label="End date">
            <input
              type="date"
              value={values.end_date}
              onChange={(event) =>
                update("end_date", event.target.value)
              }
              disabled={disabled}
              className={inputClassName}
            />
          </Field>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-950">
          Contact and emergency details
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Work email">
            <input
              type="email"
              value={values.work_email}
              onChange={(event) =>
                update("work_email", event.target.value)
              }
              disabled={disabled}
              className={inputClassName}
            />
          </Field>

          <Field label="Work phone">
            <input
              type="tel"
              value={values.work_phone}
              onChange={(event) =>
                update("work_phone", event.target.value)
              }
              disabled={disabled}
              className={inputClassName}
            />
          </Field>

          <Field label="Emergency contact name">
            <input
              value={values.emergency_contact_name}
              onChange={(event) =>
                update(
                  "emergency_contact_name",
                  event.target.value
                )
              }
              disabled={disabled}
              className={inputClassName}
            />
          </Field>

          <Field label="Relationship">
            <input
              value={values.emergency_contact_relationship}
              onChange={(event) =>
                update(
                  "emergency_contact_relationship",
                  event.target.value
                )
              }
              disabled={disabled}
              className={inputClassName}
            />
          </Field>

          <Field label="Emergency contact phone">
            <input
              type="tel"
              value={values.emergency_contact_phone}
              onChange={(event) =>
                update(
                  "emergency_contact_phone",
                  event.target.value
                )
              }
              disabled={disabled}
              className={inputClassName}
            />
          </Field>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-950">
          Right to Work and DBS
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Right to Work status">
            <select
              value={values.right_to_work_status}
              onChange={(event) =>
                update(
                  "right_to_work_status",
                  event.target
                    .value as EmploymentFormValues["right_to_work_status"]
                )
              }
              disabled={disabled}
              className={inputClassName}
            >
              <option value="">Not recorded</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="expired">Expired</option>
              <option value="not_required">
                Not required
              </option>
            </select>
          </Field>

          <Field label="Right to Work checked">
            <input
              type="date"
              value={values.right_to_work_checked_at}
              onChange={(event) =>
                update(
                  "right_to_work_checked_at",
                  event.target.value
                )
              }
              disabled={disabled}
              className={inputClassName}
            />
          </Field>

          <Field label="Right to Work expiry">
            <input
              type="date"
              value={values.right_to_work_expiry_date}
              onChange={(event) =>
                update(
                  "right_to_work_expiry_date",
                  event.target.value
                )
              }
              disabled={disabled}
              className={inputClassName}
            />
          </Field>

          <Field label="DBS status">
            <select
              value={values.dbs_status}
              onChange={(event) =>
                update(
                  "dbs_status",
                  event.target
                    .value as EmploymentFormValues["dbs_status"]
                )
              }
              disabled={disabled}
              className={inputClassName}
            >
              <option value="">Not recorded</option>
              <option value="clear">Clear</option>
              <option value="risk_assessed">
                Risk assessed
              </option>
              <option value="pending">Pending</option>
              <option value="expired">Expired</option>
              <option value="not_required">
                Not required
              </option>
            </select>
          </Field>

          <Field label="DBS level">
            <select
              value={values.dbs_level}
              onChange={(event) =>
                update(
                  "dbs_level",
                  event.target
                    .value as EmploymentFormValues["dbs_level"]
                )
              }
              disabled={disabled}
              className={inputClassName}
            >
              <option value="">Not recorded</option>
              <option value="basic">Basic</option>
              <option value="standard">Standard</option>
              <option value="enhanced">Enhanced</option>
              <option value="enhanced_with_barred_list">
                Enhanced with barred list
              </option>
            </select>
          </Field>

          <Field label="DBS certificate number">
            <input
              value={values.dbs_certificate_number}
              onChange={(event) =>
                update(
                  "dbs_certificate_number",
                  event.target.value
                )
              }
              disabled={disabled}
              className={inputClassName}
            />
          </Field>

          <Field label="DBS issue date">
            <input
              type="date"
              value={values.dbs_issue_date}
              onChange={(event) =>
                update("dbs_issue_date", event.target.value)
              }
              disabled={disabled}
              className={inputClassName}
            />
          </Field>

          <Field label="Last DBS status check">
            <input
              type="date"
              value={values.dbs_last_checked_at}
              onChange={(event) =>
                update(
                  "dbs_last_checked_at",
                  event.target.value
                )
              }
              disabled={disabled}
              className={inputClassName}
            />
          </Field>

          <Field label="Next DBS check">
            <input
              type="date"
              value={values.dbs_next_check_date}
              onChange={(event) =>
                update(
                  "dbs_next_check_date",
                  event.target.value
                )
              }
              disabled={disabled}
              className={inputClassName}
            />
          </Field>

          <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 sm:col-span-2">
            <input
              type="checkbox"
              checked={values.dbs_update_service}
              onChange={(event) =>
                update(
                  "dbs_update_service",
                  event.target.checked
                )
              }
              disabled={disabled}
              className="h-4 w-4 rounded border-slate-300"
            />

            <span className="text-sm font-medium text-slate-700">
              Registered with the DBS Update Service
            </span>
          </label>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-950">
          Occupational health
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Occupational health status">
            <select
              value={values.occupational_health_status}
              onChange={(event) =>
                update(
                  "occupational_health_status",
                  event.target
                    .value as EmploymentFormValues["occupational_health_status"]
                )
              }
              disabled={disabled}
              className={inputClassName}
            >
              <option value="">Not recorded</option>
              <option value="cleared">Cleared</option>
              <option value="cleared_with_adjustments">
                Cleared with adjustments
              </option>
              <option value="pending">Pending</option>
              <option value="review_required">
                Review required
              </option>
              <option value="not_required">
                Not required
              </option>
            </select>
          </Field>

          <Field label="Review date">
            <input
              type="date"
              value={values.occupational_health_review_date}
              onChange={(event) =>
                update(
                  "occupational_health_review_date",
                  event.target.value
                )
              }
              disabled={disabled}
              className={inputClassName}
            />
          </Field>

          <div className="sm:col-span-2">
            <Field label="Workplace adjustments">
              <textarea
                value={values.workplace_adjustments}
                onChange={(event) =>
                  update(
                    "workplace_adjustments",
                    event.target.value
                  )
                }
                disabled={disabled}
                rows={4}
                className={textareaClassName}
              />
            </Field>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-950">
          Notes
        </h2>

        <div className="mt-4">
          <textarea
            value={values.notes}
            onChange={(event) =>
              update("notes", event.target.value)
            }
            disabled={disabled}
            rows={5}
            className={textareaClassName}
          />
        </div>
      </section>
    </div>
  );
}

type FieldProps = {
  label: string;
  children: React.ReactNode;
};

function Field({ label, children }: FieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">
        {label}
      </span>

      {children}
    </label>
  );
}