export default function AuthFormShell({ children, footer }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-5">{children}</div>
      <aside className="rounded-[2rem] border border-[rgba(114,75,43,0.12)] bg-[linear-gradient(180deg,rgba(255,250,242,0.95)_0%,rgba(239,227,210,0.95)_100%)] p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--brand)]">Why it matters</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight">Built against your real backend contract.</h2>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
          This frontend uses the exact field names and routes you listed, keeps JWT in localStorage,
          and handles unstable backend responses without crashing the app.
        </p>
        {footer ? <div className="mt-6">{footer}</div> : null}
      </aside>
    </div>
  );
}
