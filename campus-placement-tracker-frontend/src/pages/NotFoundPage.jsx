import { Link } from "react-router-dom";
import { Home } from "lucide-react";

export function NotFoundPage() {
  return (
    <main className="not-found">
      <span className="eyebrow">404</span>
      <h1>Page not found</h1>
      <p>The route you opened is not part of the placement tracker.</p>
      <Link className="button primary" to="/">
        <Home size={18} />
        Home
      </Link>
    </main>
  );
}
