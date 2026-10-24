import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getSafeReturnTo } from "../lib/navigation";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
   const [params] = useSearchParams();
   const returnTo = getSafeReturnTo(params.get("returnTo"));

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(returnTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  const registerLink = returnTo ? `/register?returnTo=${encodeURIComponent(returnTo)}` : "/register";

  return (
    <div className="max-w-md mx-auto mt-16 px-4">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Log in to StayNest</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm">{error}</div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-brand-600 text-white py-2 rounded-lg font-medium hover:bg-brand-700 disabled:opacity-50"
        >
          {submitting ? "Logging in…" : "Log in"}
        </button>
      </form>
      <p className="text-sm text-slate-600 mt-4 text-center">
        No account?{" "}
        <Link to={registerLink} className="text-brand-600 font-medium">Sign up</Link>
      </p>
    </div>
  );
}