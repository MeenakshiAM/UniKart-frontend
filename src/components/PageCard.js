export default function PageCard({ title, subtitle, children }) {
  return (
    <section className="mx-auto max-w-3xl">
      <div className="mb-6">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-[var(--brand)]">
          Unikart Access
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-[var(--text)]">{title}</h1>
        {subtitle ? <p className="mt-3 max-w-2xl text-base text-[var(--muted)]">{subtitle}</p> : null}
      </div>

      <div className="card-surface rounded-[2rem] p-6 sm:p-8">{children}</div>
    </section>
  );
}
