import { useEffect, useState } from "react";
import api from "../../lib/api";
import { money, dateShort } from "../../lib/format";
import { useToast } from "../toast-context";

const STATUSES = ["PENDING", "CONFIRMED", "CHECKED_IN", "COMPLETED", "CANCELLED"];
const STATUS_LABEL = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  CHECKED_IN: "Checked in",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};
const STATUS_COLOR = {
  PENDING: "bg-yellow-50 text-yellow-700",
  CONFIRMED: "bg-green-50 text-green-700",
  CHECKED_IN: "bg-blue-50 text-blue-700",
  COMPLETED: "bg-slate-100 text-slate-700",
  CANCELLED: "bg-red-50 text-red-700",
};

export default function BookingsTab() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 20 };
      if (status) params.status = status;
      const res = await api.get("/admin/bookings", { params });
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Could not load bookings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-line */ }, [page, status]);

  async function changeStatus(id, newStatus) {
    setBusyId(id);
    try {
      await api.patch(`/admin/bookings/${id}/status`, { status: newStatus });
      toast.success("Booking status updated");
      await load();
    } catch (err) {
      toast.error(err.response?.data?.error || "Update failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600">Filter</label>
          <select
            value={status}
            onChange={(e) => { setPage(1); setStatus(e.target.value); }}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
            ))}
          </select>
        </div>
        <button
          onClick={load}
          className="text-sm text-brand-600 hover:underline"
        >
          Refresh
        </button>
      </div>

      {loading && <p className="text-slate-500">Loading…</p>}
      {error && <p className="text-red-600">{error}</p>}

      {data && !loading && (
        <>
          {data.bookings.length === 0 ? (
            <p className="text-slate-500">No bookings match this filter.</p>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">#</th>
                    <th className="px-4 py-3 font-medium">Guest</th>
                    <th className="px-4 py-3 font-medium">Hotel / Room</th>
                    <th className="px-4 py-3 font-medium">Dates</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.bookings.map((b) => (
                    <tr key={b.id} className="border-t border-slate-100">
                      <td className="px-4 py-3 text-slate-500">#{b.id}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{b.userName}</div>
                        <div className="text-xs text-slate-500">{b.userEmail}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-slate-900">{b.hotelName}</div>
                        <div className="text-xs text-slate-500">{b.roomTypeName}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {dateShort(b.checkIn)} → {dateShort(b.checkOut)}
                      </td>
                      <td className="px-4 py-3 font-medium">{money(b.totalAmount)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-md ${STATUS_COLOR[b.status]}`}>
                            {STATUS_LABEL[b.status]}
                          </span>
                          <select
                            value={b.status}
                            disabled={busyId === b.id}
                            onChange={(e) => changeStatus(b.id, e.target.value)}
                            className="text-xs border border-slate-200 rounded-md px-2 py-1"
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm">
              <span className="text-slate-500">
                Page {data.page} of {data.totalPages} · {data.total} total
              </span>
              <div className="flex gap-2">
                <button
                  disabled={data.page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1 border border-slate-200 rounded-md disabled:opacity-40"
                >
                  Prev
                </button>
                <button
                  disabled={data.page >= data.totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1 border border-slate-200 rounded-md disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}