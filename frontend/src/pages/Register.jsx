import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getSafeReturnTo } from "../lib/navigation";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [params] = useSearchParams();
  const returnTo = getSafeReturnTo(params.get("returnTo"));

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(form);
      navigate(returnTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  const loginLink = returnTo ? `/login?returnTo=${encodeURIComponent(returnTo)}` : "/login";

  return (
    <div className="max-w-md mx-auto mt-16 px-4">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Create your account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm">{error}</div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1">Full name</label>
          <input
            type="text" value={form.name} required minLength={2}
            onChange={(e) => update("name", e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email" value={form.email} required
            onChange={(e) => update("email", e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password" value={form.password} required minLength={6}
            onChange={(e) => update("password", e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-brand-600 text-white py-2 rounded-lg font-medium hover:bg-brand-700 disabled:opacity-50"
        >
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p className="text-sm text-slate-600 mt-4 text-center">
        Already have an account?{" "}
        <Link to={loginLink} className="text-brand-600 font-medium">Log in</Link>
      </p>
    </div>
  );
}