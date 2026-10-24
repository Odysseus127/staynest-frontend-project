import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { useToast } from "../components/toast-context";

async function fetchBookings() {
  const { data } = await api.get("/bookings/my");
  return data.bookings;
}

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();

  useEffect(() => {
    let cancelled = false;

    async function loadInitialBookings() {
      try {
        const data = await fetchBookings();
        if (!cancelled) setBookings(data);
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.error || "Could not load bookings");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadInitialBookings();
    return () => {
      cancelled = true;
    };
  }, []);

  async function load() {
    try {
      setBookings(await fetchBookings());
    } catch (err) {
      setError(err.response?.data?.error || "Could not load bookings");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(id) {
    if (!confirm("Cancel this booking?")) return;
    try {
      await api.patch(`/bookings/${id}/cancel`);
      setLoading(true);
      setError(null);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.error || "Cancel failed");
    }
  }

  if (loading) {
    return <div className="max-w-5xl mx-auto px-4 py-12 text-slate-500">Loading…</div>;
  }
  if (error) {
    return <div className="max-w-5xl mx-auto px-4 py-12 text-red-600">{error}</div>;
  }

  const upcoming = bookings.filter(
    (b) =>
      ["PENDING", "CONFIRMED"].includes(b.status) &&
      new Date(b.checkOut) >= new Date(new Date().toDateString())
  );
  const past = bookings.filter((b) => !upcoming.includes(b));

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">My bookings</h1>

      {bookings.length === 0 && (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
          <p className="text-slate-500">You haven't booked anything yet.</p>
          <Link
            to="/"
            className="inline-block mt-4 bg-brand-600 text-white px-5 py-2 rounded-lg hover:bg-brand-700"
          >
            Browse hotels
          </Link>
        </div>
      )}

      {upcoming.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-700 mb-3">Upcoming</h2>
          <div className="space-y-3">
            {upcoming.map((b) => (
              <BookingRow key={b.id} booking={b} onCancel={handleCancel} />
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-slate-700 mb-3">Past & cancelled</h2>
          <div className="space-y-3">
            {past.map((b) => (
              <BookingRow key={b.id} booking={b} onCancel={handleCancel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function BookingRow({ booking, onCancel }) {
  const statusColors = {
    PENDING: "bg-yellow-50 text-yellow-700",
    CONFIRMED: "bg-green-50 text-green-700",
    CHECKED_IN: "bg-blue-50 text-blue-700",
    COMPLETED: "bg-slate-100 text-slate-700",
    CANCELLED: "bg-red-50 text-red-700",
  };
  const cancellable =
    ["PENDING", "CONFIRMED"].includes(booking.status) &&
    new Date(booking.checkIn) > new Date(new Date().toDateString());

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col md:flex-row">
      <div className="md:w-40 h-32 md:h-auto bg-slate-100 shrink-0">
        <img
          src={booking.hotelImage}
          alt={booking.hotelName}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 p-4 flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900">{booking.hotelName}</h3>
          <p className="text-sm text-slate-500">
            {booking.roomTypeName} · {booking.hotelCity}
          </p>
          <p className="text-sm text-slate-600 mt-2">
            {booking.checkIn} → {booking.checkOut} · {booking.guests} guest
            {booking.guests > 1 ? "s" : ""}
          </p>
        </div>
        <div className="md:text-right shrink-0">
          <span
            className={`inline-block text-xs font-medium px-2 py-1 rounded-md ${
              statusColors[booking.status] || "bg-slate-100 text-slate-700"
            }`}
          >
            {booking.status.replace("_", " ")}
          </span>
          <div className="text-lg font-bold mt-1 text-slate-900">
            ₹{Number(booking.totalAmount).toLocaleString("en-IN")}
          </div>
          {cancellable && (
            <button
              onClick={() => onCancel(booking.id)}
              className="text-sm text-red-600 hover:text-red-700 mt-1"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}