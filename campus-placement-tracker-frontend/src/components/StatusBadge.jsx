import { formatStatus } from "../utils/format.js";

export function StatusBadge({ status }) {
  return (
    <span className={`status-badge status-${String(status).toLowerCase()}`}>
      {formatStatus(status)}
    </span>
  );
}
