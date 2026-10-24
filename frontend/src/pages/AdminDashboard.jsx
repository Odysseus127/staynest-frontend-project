import { useState, useEffect } from "react";
import api from "../lib/api";
import OverviewTab from "../components/admin/OverviewTab";
import BookingsTab from "../components/admin/BookingsTab";
import HotelsTab from "../components/admin/HotelsTab";
import RoomsTab from "../components/admin/RoomsTab";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "bookings", label: "Bookings" },
  { key: "hotels", label: "Hotels" },
  { key: "rooms", label: "Rooms" },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState("overview");
  const [hotels, setHotels] = useState([]);
  const [hotelsError, setHotelsError] = useState(null);
  const [hotelsLoading, setHotelsLoading] = useState(true);

  async function loadHotels() {
    try {
      const { data } = await api.get("/hotels", { params: { sort: "name" } });
      setHotels(data.hotels);
      setHotelsError(null);
    } catch (err) {
      setHotelsError(err.response?.data?.error || "Could not load hotels");
      throw err;
    }
  }

  useEffect(() => {
    let active = true;

    api.get("/hotels", { params: { sort: "name" } })
      .then(({ data }) => {
        if (active) setHotels(data.hotels);
      })
      .catch((err) => {
        if (active) {
          setHotelsError(err.response?.data?.error || "Could not load hotels");
        }
      })
      .finally(() => {
        if (active) setHotelsLoading(false);
      });

    return () => { active = false; };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Admin dashboard</h1>
        <p className="text-slate-500 mt-1">Manage hotels, rooms, and bookings.</p>
      </div>

      <div className="border-b border-slate-200 mb-6">
        <nav className="flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key
                  ? "border-brand-600 text-brand-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {hotelsError && (tab === "hotels" || tab === "rooms") && (
        <p className="mb-4 text-red-600">{hotelsError}</p>
      )}

      {tab === "overview" && <OverviewTab />}
      {tab === "bookings" && <BookingsTab />}
      {tab === "hotels" && <HotelsTab hotels={hotels} reloadHotels={loadHotels} />}
      {tab === "rooms" && (
        <RoomsTab
          hotels={hotels}
          hotelsError={hotelsError}
          hotelsLoading={hotelsLoading}
        />
      )}
    </div>
  );
}