import { useEffect, useState } from "react";
import api from "../../lib/api";
import { money, dateShort } from "../../lib/format";

export default function OverviewTab() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get("/admin/stats");
        if (!cancelled) setStats(data);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.error || "Could not load stats");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <p className="text-slate-500">Loading…</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!stats) return null;

  const cards = [
    { label: "Total revenue", value: money(stats.totals.revenue), accent: "bg-emerald-50 text-emerald-700" },
    { label: "Bookings", value: stats.totals.bookings, accent: "bg-brand-50 text-brand-700" },
    { label: "Hotels", value: stats.totals.hotels, accent: "bg-purple-50 text-purple-700" },
    { label: "Room types", value: stats.totals.rooms, accent: "bg-amber-50 text-amber-700" },
    { label: "Users", value: stats.totals.users, accent: "bg-slate-100 text-slate-700" },
  ];

  const statusItems = [
    { key: "pending", label: "Pending", color: "bg-yellow-50 text-yellow-700" },
    { key: "confirmed", label: "Confirmed", color: "bg-green-50 text-green-700" },
    { key: "checkedIn", label: "Checked in", color: "bg-blue-50 text-blue-700" },
    { key: "completed", label: "Completed", color: "bg-slate-100 text-slate-700" },
    { key: "cancelled", label: "Cancelled", color: "bg-red-50 text-red-700" },
  ];

  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">{c.label}</p>
            <p className={`text-2xl font-bold mt-2 ${c.accent.includes("text") ? "" : ""}`}>
              {c.value}
            </p>
          </div>
        ))}
      </div>

      {/* Today + Status breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Today</h3>
          <div className="flex gap-6">
            <div>
              <p className="text-3xl font-bold text-slate-900">{stats.today.checkinsToday}</p>
              <p className="text-sm text-slate-500 mt-1">Check-ins</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900">{stats.today.checkoutsToday}</p>
              <p className="text-sm text-slate-500 mt-1">Check-outs</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Bookings by status</h3>
          <div className="space-y-2">
            {statusItems.map((s) => (
              <div key={s.key} className="flex items-center justify-between text-sm">
                <span className={`px-2 py-1 rounded-md ${s.color}`}>{s.label}</span>
                <span className="font-semibold text-slate-900">
                  {stats.byStatus[s.key] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent bookings */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">Recent bookings</h3>
        </div>
        {stats.recentBookings.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">No bookings yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Guest</th>
                <th className="px-4 py-3 font-medium">Hotel</th>
                <th className="px-4 py-3 font-medium">Dates</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentBookings.map((b) => (
                <tr key={b.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">{b.userName}</td>
                  <td className="px-4 py-3">{b.hotelName}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {dateShort(b.checkIn)} → {dateShort(b.checkOut)}
                  </td>
                  <td className="px-4 py-3 font-medium">{money(b.totalAmount)}</td>
                  <td className="px-4 py-3 text-slate-600">{b.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}