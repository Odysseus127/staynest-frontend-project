import { Link } from "react-router-dom";

export default function HotelCard({ hotel }) {
  return (
    <Link
      to={`/hotels/${hotel.slug}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
    >
      <div className="aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={hotel.coverImage}
          alt={hotel.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-lg text-slate-900">{hotel.name}</h3>
            <p className="text-sm text-slate-500">{hotel.city}</p>
          </div>
          <span className="flex items-center gap-1 text-sm font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
            ★ {hotel.rating}
          </span>
        </div>

        <p className="text-sm text-slate-600 mt-2 line-clamp-2">{hotel.description}</p>

        <div className="mt-3 flex items-baseline gap-1">
          <span className="text-lg font-bold text-slate-900">
            ₹{Number(hotel.priceFrom).toLocaleString("en-IN")}
          </span>
          <span className="text-sm text-slate-500">/ night</span>
        </div>
      </div>
    </Link>
  );
}