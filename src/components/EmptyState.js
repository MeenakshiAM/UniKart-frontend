export default function EmptyState({ title, description, action }) {
  return (
    <div className="card-surface rounded-[2rem] p-8 text-center">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--muted)]">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
