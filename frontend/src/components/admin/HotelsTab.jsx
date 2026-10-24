import { useState } from "react";
import api from "../../lib/api";
import { money } from "../../lib/format";
import Modal from "./Modal";
import { useToast } from "../toast-context";

const EMPTY = {
  name: "", slug: "", city: "", address: "",
  description: "", rating: 4.0, priceFrom: 3000,
  coverImage: "", gallery: "",
};

export default function HotelsTab({ hotels, reloadHotels }) {
  const toast = useToast();
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null); // null | { mode: "create"|"edit", form }

  function openCreate() {
    setModal({ mode: "create", form: { ...EMPTY } });
  }

  function openEdit(hotel) {
    setModal({
      mode: "edit",
      id: hotel.id,
      form: {
        name: hotel.name,
        slug: hotel.slug,
        city: hotel.city,
        address: hotel.address,
        description: hotel.description || "",
        rating: Number(hotel.rating),
        priceFrom: Number(hotel.priceFrom),
        coverImage: hotel.coverImage || "",
        gallery: Array.isArray(hotel.gallery) ? hotel.gallery.join(", ") : "",
      },
    });

  }

  async function handleSave(e) {
    e.preventDefault();
    const { mode, form, id } = modal;
    setError(null);
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      city: form.city.trim(),
      address: form.address.trim(),
      description: form.description.trim() || undefined,
      rating: Number(form.rating),
      priceFrom: Number(form.priceFrom),
      coverImage: form.coverImage.trim() || undefined,
      gallery: form.gallery.split(",").map((s) => s.trim()).filter(Boolean),
    };
    try {
      if (mode === "create") await api.post("/admin/hotels", payload);
      else await api.patch(`/admin/hotels/${id}`, payload);
      toast.success(mode === "create" ? "Hotel created" : "Hotel updated");
      setModal(null);
      await reloadHotels();
    } catch (err) {
      setError(err.response?.data?.error || "Save failed");
    }
  }

  async function handleDelete(hotel) {
    if (!confirm(`Delete "${hotel.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/hotels/${hotel.id}`);
      toast.success("Hotel deleted");
      await reloadHotels();
    } catch (err) {
      toast.error(err.response?.data?.error || "Delete failed");
    }
  }

  
 
 
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">{hotels.length} hotel{hotels.length !== 1 ? "s" : ""}</p>
        <button
          onClick={openCreate}
          className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700"
        >
          + Add hotel
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Hotel</th>
              <th className="px-4 py-3 font-medium">City</th>
              <th className="px-4 py-3 font-medium">Rating</th>
              <th className="px-4 py-3 font-medium">From</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {hotels.map((h) => (
              <tr key={h.id} className="border-t border-slate-100">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={h.coverImage}
                      alt=""
                      className="w-12 h-12 rounded-md object-cover bg-slate-100"
                    />
                    <div>
                      <div className="font-medium text-slate-900">{h.name}</div>
                      <div className="text-xs text-slate-500">/{h.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">{h.city}</td>
                <td className="px-4 py-3">★ {h.rating}</td>
                <td className="px-4 py-3">{money(h.priceFrom)}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(h)} className="text-brand-600 hover:underline mr-3">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(h)} className="text-red-600 hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal
          title={modal.mode === "create" ? "Add hotel" : "Edit hotel"}
          onClose={() => setModal(null)}
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleSave} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Name" value={modal.form.name}
                onChange={(v) => setModal({ ...modal, form: { ...modal.form, name: v } })}
                required />
              <Field label="Slug" value={modal.form.slug}
                onChange={(v) => setModal({ ...modal, form: { ...modal.form, slug: v.toLowerCase() } })}
                hint="lowercase-letters-and-hyphens"
                required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="City" value={modal.form.city}
                onChange={(v) => setModal({ ...modal, form: { ...modal.form, city: v } })}
                required />
              <Field label="Address" value={modal.form.address}
                onChange={(v) => setModal({ ...modal, form: { ...modal.form, address: v } })}
                required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={modal.form.description}
                onChange={(e) => setModal({ ...modal, form: { ...modal.form, description: e.target.value } })}
                rows={3}
                className="w-full border border-slate-200 rounded-lg px-3 py-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Rating (0–5)" type="number" step="0.1" min="0" max="5"
                value={modal.form.rating}
                onChange={(v) => setModal({ ...modal, form: { ...modal.form, rating: v } })} />
              <Field label="Price from (₹)" type="number" min="0"
                value={modal.form.priceFrom}
                onChange={(v) => setModal({ ...modal, form: { ...modal.form, priceFrom: v } })} />
            </div>
            <Field label="Cover image URL" value={modal.form.coverImage}
              onChange={(v) => setModal({ ...modal, form: { ...modal.form, coverImage: v } })}
              hint="/images/hotels/{slug}/exterior.jpg" />
            <div>
              <label className="block text-sm font-medium mb-1">Gallery URLs</label>
              <input
                value={modal.form.gallery}
                onChange={(e) => setModal({ ...modal, form: { ...modal.form, gallery: e.target.value } })}
                placeholder="/images/...,/images/..."
                className="w-full border border-slate-200 rounded-lg px-3 py-2"
              />
              <p className="text-xs text-slate-500 mt-1">Comma-separated image URLs</p>
            </div>

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