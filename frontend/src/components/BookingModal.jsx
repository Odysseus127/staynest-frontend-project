import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/useAuth";
import { useToast } from "./toast-context";

function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDaysToDate(dateString, days) {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + days);
  return formatLocalDate(date);
}

export default function BookingModal({ room, hotel, initial, onClose }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const location = useLocation();

  const [checkIn, setCheckIn] = useState(initial?.checkIn || "");
  const [checkOut, setCheckOut] = useState(initial?.checkOut || "");
  const [guests, setGuests] = useState(initial?.guests || 1);
  const [availabilityResult, setAvailabilityResult] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const today = formatLocalDate(new Date());
  const minCheckOut = checkIn ? addDaysToDate(checkIn, 1) : today;

  const nights =
    checkIn && checkOut
      ? Math.max(0, Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000))
      : 0;
  const datesValid =
    Boolean(checkIn && checkOut && checkIn >= today && checkOut > checkIn);
  const total = nights * Number(room.basePrice);
  const guestCount = Number(guests);
  const guestsValid =
    Number.isInteger(guestCount) &&
    guestCount >= 1 &&
    guestCount <= Number(room.capacity);
  const availabilityKey = JSON.stringify([room.id, checkIn, checkOut]);
  const currentAvailability =
    availabilityResult?.key === availabilityKey ? availabilityResult : null;
  const availability = currentAvailability?.data;

  useEffect(() => {
    if (!datesValid || nights <= 0) return;

    let cancelled = false;

    async function check() {
      try {
        const { data } = await api.get("/bookings/availability", {
          params: { roomTypeId: room.id, checkIn, checkOut },
        });
        if (!cancelled) {
          setAvailabilityResult({
            key: JSON.stringify([room.id, checkIn, checkOut]),
            data,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setAvailabilityResult({
            key: JSON.stringify([room.id, checkIn, checkOut]),
            error:
              err.response?.data?.error ||
              "Could not check availability. You can still try booking.",
          });
        }
      }
    }

    check();
    return () => { cancelled = true; };
  }, [checkIn, checkOut, datesValid, nights, room.id]);

  async function handleBook() {
    if (!datesValid || nights <= 0) {
      setError("Choose a check-out date after check-in.");
      return;
    }
    if (!guestsValid) {
      setError(`Choose between 1 and ${room.capacity} guests.`);
      return;
    }

    if (!isAuthenticated) {
      sessionStorage.setItem("pendingBooking", JSON.stringify({
        roomTypeId: room.id,
        checkIn, checkOut, guests: Number(guests),
      }));
      const returnTo = `${location.pathname}?book=${room.id}`;
      navigate(`/login?returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await api.post("/bookings", {
        roomTypeId: room.id,
        checkIn,
        checkOut,
        guests: guestCount,
      });
      sessionStorage.removeItem("pendingBooking");
      toast.success("Booking confirmed!");
      navigate("/bookings");
    } catch (err) {
      setError(err.response?.data?.error || "Booking failed");
    } finally {
      setSubmitting(false);
    }
  }
  

  const canBook =
    datesValid &&
    nights > 0 &&
    guestsValid &&
    !submitting &&
    (!availability || availability.available > 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-auto">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold">Book {room.name}</h2>
            <p className="text-sm text-slate-500">{hotel.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Check-in</label>
              <input
                type="date"
                min={today}
                value={checkIn}
                onChange={(e) => {
                  setCheckIn(e.target.value);
                  if (checkOut && e.target.value >= checkOut) setCheckOut("");
                  setError(null);
                }}
                className="w-full border border-slate-200 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Check-out</label>
              <input
                type="date"
                min={minCheckOut}
                value={checkOut}
                onChange={(e) => {
                  setCheckOut(e.target.value);
                  setError(null);
                }}
                className="w-full border border-slate-200 rounded-lg px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Guests</label>
            <input
              type="number"
              min={1}
              max={room.capacity}
              value={guests}
              onChange={(e) => {
                setGuests(e.target.value);
                setError(null);
              }}
              className="w-full border border-slate-200 rounded-lg px-3 py-2"
            />
            <p className="text-xs text-slate-500 mt-1">Max {room.capacity} guests</p>
            {!guestsValid && (
              <p className="text-xs text-red-600 mt-1">
                Choose between 1 and {room.capacity} guests.
              </p>
            )}
          </div>

          {availability && nights > 0 && (
            <div
              className={`text-sm px-3 py-2 rounded-lg ${
                availability.available > 0
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {availability.available > 0
                ? `${availability.available} room${availability.available > 1 ? "s" : ""} available for these dates`
                : "No rooms available for these dates"}
            </div>
          )}

          {currentAvailability?.error && nights > 0 && (
            <p className="text-sm text-amber-700">{currentAvailability.error}</p>
          )}

          {nights > 0 && (
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex justify-between text-sm">
                <span>
                  ₹{Number(room.basePrice).toLocaleString("en-IN")} × {nights} night
                  {nights > 1 ? "s" : ""}
                </span>
                <span>₹{total.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg mt-2 pt-2 border-t border-slate-200">
                <span>Total</span>
                <span>₹{total.toLocaleString("en-IN")}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <button
            onClick={handleBook}
            disabled={!isAuthenticated ? false : !canBook}
            className="w-full bg-brand-600 text-white py-3 rounded-lg font-medium hover:bg-brand-700 disabled:opacity-50"
          >
            {!isAuthenticated
              ? "Login to book"
              : submitting
              ? "Booking…"
              : nights > 0
              ? `Book — ₹${total.toLocaleString("en-IN")}`
              : "Select dates"}
          </button>
        </div>
      </div>
    </div>
  );
}