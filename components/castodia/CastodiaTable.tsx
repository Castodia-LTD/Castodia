import type { ReactNode } from "react";
import { castodiaTheme } from "./theme";

type CastodiaTableProps = {
  headers: string[];
  children: ReactNode;
};

export default function CastodiaTable({
  headers,
  children,
}: CastodiaTableProps) {
  return (
    <div className={castodiaTheme.table.wrapper}>
      <table className={castodiaTheme.table.table}>
        <thead className={castodiaTheme.table.thead}>
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className={castodiaTheme.table.th}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {children}
        </tbody>
      </table>
    </div>
  );
}
export function CastodiaRow({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <tr className="transition hover:bg-slate-50">
      {children}
    </tr>
  );
}

export function CastodiaCell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <td className="px-4 py-4 text-sm text-slate-700">
      {children}
    </td>
  );
}