import { useEffect, useState } from "react";
import api from "../lib/api";
import HotelCard from "../components/HotelCard";
import { HotelCardSkeleton } from "../components/Skeleton";

export default function Home() {
  const [hotels, setHotels] = useState([]);
  const [city, setCity] = useState("");
  const [sort, setSort] = useState("rating");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get("/hotels", { params: { city, sort } });
        if (!cancelled) setHotels(data.hotels);
      } catch {
        if (!cancelled) setError("Could not load hotels. Try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    const t = setTimeout(load, 250); // debounce city search
    return () => { cancelled = true; clearTimeout(t); };
  }, [city, sort]);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-600 to-brand-700 text-white py-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold">Find your perfect stay</h1>
          <p className="mt-3 text-brand-50/90">
            Handpicked hotels across India — from luxury escapes to backpacker havens.
          </p>
        </div>
      </section>

      {/* Search */}
      <section className="max-w-5xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-2xl shadow-lg p-4 flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="Search by city (e.g. Goa, Mumbai, Jaipur)"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="flex-1 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="rating">Top rated</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
            <option value="name">Name (A–Z)</option>
          </select>
        </div>
      </section>

      {/* Results */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          {city ? `Hotels in "${city}"` : "Featured hotels"}
        </h2>

        {error && <p className="text-red-600">{error}</p>}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <HotelCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!loading && !error && hotels.length === 0 && (
          <p className="text-slate-500">No hotels match your search.</p>
        )}

        {!loading && !error && hotels.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((h) => <HotelCard key={h.id} hotel={h} />)}
          </div>
        )}
      </section>
    </div>
  );
}