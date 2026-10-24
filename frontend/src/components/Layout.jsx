import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} StayNest — Find your perfect stay.
      </footer>
    </div>
  );
}