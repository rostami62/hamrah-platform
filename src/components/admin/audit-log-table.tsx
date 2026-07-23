interface AuditLogRow {
  id: number;
  action: string;
  target_table: string | null;
  created_at: string;
}

export function AuditLogTable({ logs }: { logs: AuditLogRow[] }) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-primary-900">لاگ اخیر سامانه</h2>
      <div className="surface overflow-x-auto rounded-[var(--radius-card)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-primary-600">
              <th className="p-3 text-right font-medium">رویداد</th>
              <th className="p-3 text-right font-medium">جدول</th>
              <th className="p-3 text-right font-medium">زمان</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-line last:border-0">
                <td className="p-3 text-primary-800">{log.action}</td>
                <td className="p-3 text-primary-600">{log.target_table ?? "—"}</td>
                <td className="p-3 text-primary-600">
                  {new Date(log.created_at).toLocaleString("fa-IR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
