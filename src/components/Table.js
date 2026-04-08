export default function Table({ columns, rows, emptyMessage = "No data found.", rowKey }) {
  if (!rows?.length) {
    return (
      <div className="rounded-[1.75rem] border border-dashed border-[rgba(114,75,43,0.24)] bg-white/50 p-8 text-center text-sm text-[var(--muted)]">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-[rgba(114,75,43,0.12)] bg-white/70">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[rgba(114,75,43,0.1)]">
          <thead className="bg-[rgba(157,60,31,0.06)]">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(114,75,43,0.08)]">
            {rows.map((row, index) => (
              <tr key={typeof rowKey === "function" ? rowKey(row, index) : row[rowKey] || index}>
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-4 align-top text-sm text-[var(--text)]">
                    {column.render ? column.render(row, index) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
