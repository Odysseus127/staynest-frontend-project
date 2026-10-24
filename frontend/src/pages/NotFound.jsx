import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto py-24 text-center px-4">
      <h1 className="text-4xl font-bold text-slate-900">404</h1>
      <p className="text-slate-600 mt-2">Page not found.</p>
      <Link to="/" className="inline-block mt-6 bg-brand-600 text-white px-6 py-2 rounded-lg">
        Back home
      </Link>
    </div>
  );
}