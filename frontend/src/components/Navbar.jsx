import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-brand-600">
          StayNest
        </Link>

        <div className="flex items-center gap-4">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `text-sm font-medium ${isActive ? "text-brand-600" : "text-slate-600 hover:text-slate-900"}`
            }
          >
            Hotels
          </NavLink>

          {isAuthenticated && (
            <NavLink
              to="/bookings"
              className={({ isActive }) =>
                `text-sm font-medium ${isActive ? "text-brand-600" : "text-slate-600 hover:text-slate-900"}`
              }
            >
              My Bookings
            </NavLink>
          )}

          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `text-sm font-medium ${isActive ? "text-brand-600" : "text-slate-600 hover:text-slate-900"}`
              }
            >
              Admin
            </NavLink>
          )}

          <div className="w-px h-6 bg-slate-200" />

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-600">
                Hi, <span className="font-medium text-slate-900">{user.name}</span>
              </span>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-slate-600 hover:text-red-600"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}