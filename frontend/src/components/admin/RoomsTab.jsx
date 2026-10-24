import { useEffect, useState } from "react";
import api from "../../lib/api";
import { money } from "../../lib/format";
import Modal from "./Modal";
import { useToast } from "../toast-context";

const EMPTY = {
  name: "", description: "", capacity: 2,
  basePrice: 3000, totalRooms: 5, imageUrl: "",
};

export default function RoomsTab({ hotels, hotelsError, hotelsLoading }) {
  const toast = useToast();
  const [hotelId, setHotelId] = useState("");
  const [rooms, setRooms] = useState([]);
  const [roomsHotelId, setRoomsHotelId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);

  const selectedHotelId = hotels.some((hotel) => String(hotel.id) === hotelId)
    ? hotelId
    : String(hotels[0]?.id || "");

  async function loadRooms(id) {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/rooms/${id}`);
      setRooms(data.rooms);
      setRoomsHotelId(id);
    } catch (err) {
      setRooms([]);
      setRoomsHotelId(id);
      if (err.response?.status !== 404) {
        setError(err.response?.data?.error || "Could not load rooms");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!selectedHotelId) return undefined;

    let active = true;

    api.get(`/rooms/${selectedHotelId}`)
      .then(({ data }) => {
        if (active) {
          setRooms(data.rooms);
          setRoomsHotelId(selectedHotelId);
          setError(null);
        }
      })
      .catch((err) => {
        if (!active) return;
        setRooms([]);
        setRoomsHotelId(selectedHotelId);
        if (err.response?.status === 404) setError(null);
        else setError(err.response?.data?.error || "Could not load rooms");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [selectedHotelId]);


  function handleHotelChange(id) {
    setLoading(true);
    setError(null);
    setHotelId(id);
  }

  function openCreate() {
    setModal({ mode: "create", form: { ...EMPTY } });
  }

  function openEdit(room) {
    setModal({
      mode: "edit",
      id: room.id,
      form: {
        name: room.name,
        description: room.description || "",
        capacity: room.capacity,
        basePrice: Number(room.basePrice),
        totalRooms: room.totalRooms,
        imageUrl: room.imageUrl || "",
      },
    });
  }

  async function handleSave(e) {
    e.preventDefault();
    const { mode, form, id } = modal;
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      capacity: Number(form.capacity),
      basePrice: Number(form.basePrice),
      totalRooms: Number(form.totalRooms),
      imageUrl: form.imageUrl.trim() || undefined,
    };
    try {
      if (mode === "create") {
        await api.post("/admin/rooms", {
          ...payload,
          hotelId: Number(selectedHotelId),
        });
      } else {
        await api.patch(`/admin/rooms/${id}`, payload);
      }
      setModal(null);
      await loadRooms(selectedHotelId);
    } catch (err) {
      setError(err.response?.data?.error || "Save failed");
    }
  }

  async function handleDelete(room) {
    if (!confirm(`Delete "${room.name}"?`)) return;
    try {
      await api.delete(`/admin/rooms/${room.id}`);
      toast.success("Room type deleted");
      await loadRooms(selectedHotelId);
    } catch (err) {
      toast.error(err.response?.data?.error || "Delete failed");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600">Hotel</label>
          <select
            value={selectedHotelId}
            onChange={(e) => handleHotelChange(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm"
          >
            {hotels.map((h) => (
              <option key={h.id} value={h.id}>{h.name} — {h.city}</option>
            ))}
          </select>
        </div>
        <button
          onClick={openCreate}
          disabled={!selectedHotelId}
          className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
        >
          + Add room type
        </button>
      </div>

      {hotels.length === 0 && !hotelsLoading && !hotelsError && (
        <p className="text-slate-500">Create a hotel before adding room types.</p>
      )}
      {selectedHotelId && loading && <p className="text-slate-500">Loading…</p>}
      {roomsHotelId === selectedHotelId && error && (
        <p className="text-red-600">{error}</p>
      )}

      {selectedHotelId && roomsHotelId === selectedHotelId && !loading && !error && rooms.length === 0 && (
        <p className="text-slate-500">No room types yet for this hotel.</p>
      )}

      {selectedHotelId && roomsHotelId === selectedHotelId && !loading && !error && rooms.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Room</th>
                <th className="px-4 py-3 font-medium">Capacity</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Inventory</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((r) => (
                <tr key={r.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={r.imageUrl} alt="" className="w-12 h-12 rounded-md object-cover bg-slate-100" />
                      <div>
                        <div className="font-medium text-slate-900">{r.name}</div>
                        <div className="text-xs text-slate-500 line-clamp-1 max-w-xs">
                          {r.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{r.capacity}</td>
                  <td className="px-4 py-3">{money(r.basePrice)}</td>
                  <td className="px-4 py-3">{r.totalRooms}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(r)} className="text-brand-600 hover:underline mr-3">Edit</button>
                    <button onClick={() => handleDelete(r)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal
          title={modal.mode === "create" ? "Add room type" : "Edit room type"}
          onClose={() => setModal(null)}
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleSave} className="space-y-3">
            <Field label="Name" value={modal.form.name} required
              onChange={(v) => setModal({ ...modal, form: { ...modal.form, name: v } })} />
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={modal.form.description}
                onChange={(e) => setModal({ ...modal, form: { ...modal.form, description: e.target.value } })}
                rows={2}
                className="w-full border border-slate-200 rounded-lg px-3 py-2"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Capacity" type="number" min="1" step="1" required value={modal.form.capacity}
                onChange={(v) => setModal({ ...modal, form: { ...modal.form, capacity: v } })} />
              <Field label="Base price (₹)" type="number" min="0" required value={modal.form.basePrice}
                onChange={(v) => setModal({ ...modal, form: { ...modal.form, basePrice: v } })} />
              <Field label="Total rooms" type="number" min="1" step="1" required value={modal.form.totalRooms}
                onChange={(v) => setModal({ ...modal, form: { ...modal.form, totalRooms: v } })} />
            </div>
            <Field label="Image URL" value={modal.form.imageUrl}
              onChange={(v) => setModal({ ...modal, form: { ...modal.form, imageUrl: v } })}
              hint="/images/hotels/{slug}/{room}.jpg" />

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <div className="flex gap-2 pt-2">
              <button type="submit"
                className="bg-brand-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-brand-700">
                {modal.mode === "create" ? "Create" : "Save changes"}
              </button>
              <button type="button" onClick={() => setModal(null)}
                className="px-5 py-2 rounded-lg border border-slate-200 text-slate-700">
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required, hint, ...rest }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-slate-200 rounded-lg px-3 py-2"
        {...rest}
      />
      {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
    </div>
  );
}