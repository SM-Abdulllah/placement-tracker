import { Loader2, Search } from "lucide-react";

export function LoadingState({ label = "Loading" }) {
  return (
    <div className="state-box">
      <Loader2 className="spin" size={22} />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({ title, text, action }) {
  return (
    <div className="state-box empty-state">
      <Search size={24} />
      <h3>{title}</h3>
      {text ? <p>{text}</p> : null}
      {action}
    </div>
  );
}

export function ErrorList({ error }) {
  if (!error) return null;

  return (
    <div className="alert error-alert" role="alert">
      <strong>{error.message || error}</strong>
      {error.errors?.length ? (
        <ul>
          {error.errors.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
