export default function PageHero({ eyebrow, title, subtitle, actions }) {
  return (
    <section className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {eyebrow ? (
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.28em] text-[var(--brand)]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-4xl font-semibold tracking-tight text-[var(--text)]">{title}</h1>
        {subtitle ? <p className="mt-3 max-w-3xl text-base text-[var(--muted)]">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </section>
  );
}
