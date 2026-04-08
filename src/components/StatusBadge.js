const STATUS_STYLES = {
  PENDING: "border-[rgba(154,97,16,0.2)] bg-[rgba(154,97,16,0.08)] text-[var(--warning)]",
  UNDER_REVIEW: "border-[rgba(118,86,66,0.2)] bg-[rgba(118,86,66,0.08)] text-[var(--muted)]",
  RESOLVED: "border-[rgba(24,96,61,0.2)] bg-[rgba(24,96,61,0.08)] text-[var(--success)]",
  REJECTED: "border-[rgba(161,43,43,0.2)] bg-[rgba(161,43,43,0.08)] text-[var(--danger)]",
};

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.PENDING;

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.15em] ${style}`}>
      {String(status || "UNKNOWN").replaceAll("_", " ")}
    </span>
  );
}
