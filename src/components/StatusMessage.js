export default function StatusMessage({ type = "info", children }) {
  if (!children) {
    return null;
  }

  const className =
    type === "success" ? "status-success" : type === "error" ? "status-error" : "status-info";

  return <div className={className}>{children}</div>;
}
