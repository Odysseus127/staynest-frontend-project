import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import api from "../lib/api";
import BookingModal from "../components/BookingModal";

function getPendingBooking(roomId) {
  try {
    const pending = JSON.parse(sessionStorage.getItem("pendingBooking") || "null");
    return String(pending?.roomTypeId) === String(roomId) ? pending : null;
  } catch {
    return null;
  }
}

export default function HotelDetail() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const requestedRoomId = searchParams.get("book");
  const requestedRoom = hotel?.rooms?.find(
    (room) => String(room.id) === requestedRoomId
  );
  const pendingBooking = requestedRoom
    ? getPendingBooking(requestedRoom.id)
    : null;
  const activeRoom = selectedRoom || requestedRoom;

  function closeBookingModal() {
    setSelectedRoom(null);
    if (searchParams.has("book")) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("book");
      setSearchParams(nextParams, { replace: true });
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get(`/hotels/${slug}`);
        if (!cancelled) {
          setHotel(data.hotel);
          setActiveImage(data.hotel.coverImage);
        }
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.error || "Hotel not found");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return <div className="max-w-5xl mx-auto px-4 py-12 text-slate-500">Loading…</div>;
  }
  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <p className="text-red-600">{error}</p>
        <Link to="/" className="inline-block mt-4 text-brand-600 hover:underline">
          ← Back to hotels
        </Link>
      </div>
    );
  }
  if (!hotel) return null;

  const gallery = [...new Set([hotel.coverImage, ...(hotel.gallery || [])].filter(Boolean))];
  const thumbs = gallery.filter((img) => img !== activeImage).slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link to="/" className="text-sm text-brand-600 hover:underline">
          ← Back to hotels
        </Link>
        <div className="flex items-start justify-between gap-4 mt-3">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{hotel.name}</h1>
            <p className="text-slate-500 mt-1">{hotel.address}</p>
          </div>
          <span className="flex items-center gap-1 text-base font-semibold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg">
            ★ {hotel.rating}
          </span>
        </div>
        <p className="text-slate-700 mt-4 max-w-3xl">{hotel.description}</p>
      </div>

      {/* Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-10">
        <div className="md:col-span-3 aspect-[16/10] rounded-xl overflow-hidden bg-slate-100">
          <img src={activeImage} alt={hotel.name} className="w-full h-full object-cover" />
        </div>
        <div className="grid grid-cols-3 md:grid-cols-1 gap-2">
          {thumbs.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveImage(img)}
              className="aspect-square rounded-lg overflow-hidden bg-slate-100 ring-2 ring-transparent hover:ring-brand-500 transition-all"
              aria-label={`View image ${i + 1}`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Rooms */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Choose your room</h2>
        {(!hotel.rooms || hotel.rooms.length === 0) && (
          <p className="text-slate-500">No rooms listed yet.</p>
        )}

        <div className="space-y-4">
          {hotel.rooms?.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex flex-col md:flex-row"
            >
              <div className="md:w-64 aspect-[16/10] md:aspect-auto bg-slate-100 shrink-0">
                <img src={room.imageUrl} alt={room.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 p-5 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-slate-900">{room.name}</h3>
                  <p className="text-sm text-slate-500 mt-1">{room.description}</p>
                  <p className="text-sm text-slate-600 mt-2">
                    Sleeps up to {room.capacity} · {room.totalRooms} rooms in inventory
                  </p>
                </div>
                <div className="md:text-right shrink-0">
                  <div className="text-xl font-bold text-slate-900">
                    ₹{Number(room.basePrice).toLocaleString("en-IN")}
                  </div>
                  <div className="text-sm text-slate-500 mb-2">per night</div>
                  <button
                    onClick={() => setSelectedRoom(room)}
                    className="bg-brand-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-brand-700"
                  >
                    Book now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {activeRoom && (
        <BookingModal
          key={activeRoom.id}
          room={activeRoom}
          hotel={hotel}
          initial={requestedRoom ? pendingBooking : undefined}
          onClose={closeBookingModal}
        />
      )}
    </div>
  );
}