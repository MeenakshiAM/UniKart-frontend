export default function Panel({ children, className = "" }) {
  return <div className={`card-surface rounded-[2rem] p-5 sm:p-6 ${className}`.trim()}>{children}</div>;
}
