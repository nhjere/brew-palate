import { useMemo, useState } from "react";
import axios from "axios";
import brewery_barrel from '../../assets/brewery_barrel.png'

const TYPE_OPTIONS = [
  { value: "", label: "Select a type..." },
  { value: "micro", label: "Micro – Most craft breweries" },
  { value: "nano", label: "Nano – Extremely small, local distribution" },
  { value: "regional", label: "Regional – Expanded regional location" },
  { value: "brewpub", label: "Brewpub – Restaurant/bar with brewery on‑premise" },
  { value: "planning", label: "Planning – In planning, not yet open" },
];

export default function BreweryCard({ brewery, onSaved, token }) {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  // Read-mode values come from DTO json keys you already use on the UI
  const read = useMemo(
    () => ({
      name: brewery?.name || "",
      brewery_type: brewery?.brewery_type || "",
      street: brewery?.street || "",
      city: brewery?.city || "",
      state: brewery?.state || "",
      postal_code: brewery?.postal_code || "",
      country: brewery?.country || "",
      phone: brewery?.phone || "",
      website_url: brewery?.website_url || "",
    }),
    [brewery]
  );

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Edit form mirrors the DTO json shape expected by your @JsonProperty mapping
  const [form, setForm] = useState(read);

  const startEdit = () => {
    setForm(read);
    setIsEditing(true);
    setError("");
  };

  const cancelEdit = () => {
    setForm(read);
    setIsEditing(false);
    setError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const canSave =
    form.name.trim() &&
    form.city.trim() &&
    form.country.trim() &&
    !saving;

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      if (!token) throw new Error("Missing auth token — please sign in.");

      // Send only the editable fields your backend allows (partial PATCH)
      const payload = {
        name: form.name,
        brewery_type: form.brewery_type || null,
        street: form.street || null,
        city: form.city,
        state: form.state || null,
        postal_code: form.postal_code || null,
        country: form.country,
        phone: form.phone || null,
        website_url: form.website_url || null,
      };

      await axios.patch(`${BASE_URL}/api/brewer/breweries/update`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setIsEditing(false);
      onSaved?.(); // refresh parent
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || e.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className=" relative w-full rounded-xl overflow-hidden">
      {/* Header / actions */}
      <div className="flex items-center justify-between ">
        <div className="pointer-events-none absolute inset-0 z-0 opacity-10">
        <img
          src={brewery_barrel}
          alt=""
          className="w-full h-full object-cover scale-[1.5]"
        />
        </div>

        <h3 className="text-2xl md:text-3xl font-extrabold text-amber-900 leading-tight">
          {isEditing ? "Edit Brewery" : read.name || "Brewery"}
        </h3>

        {!isEditing ? (
          <button
            className="bg-blue-200 hover:bg-blue-300 text-black px-4 py-1 rounded-full font-semibold"
            onClick={startEdit}
          >
            Edit
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={cancelEdit}
              className="px-4 py-1 rounded-full border border-gray-300 hover:bg-gray-50"
              type="button"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!canSave}
              className="bg-blue-200 hover:bg-blue-300 disabled:opacity-60 text-black px-4 py-1 rounded-full font-semibold"
              type="button"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        )}
      </div>

      {/* Body */}
      {!isEditing ? (
        // READ MODE — adminy, compact summary grid
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-amber-900">
          <Field label='Brewery ID' value={brewery.breweryId || "-"} />
          <Field label="Brewery Type" value={read.brewery_type || "—"} />
          <Field label="Street" value={read.street || "—"} />
          <Field label="City" value={read.city || "—"} />
          <Field label="State" value={read.state || "—"} />
          <Field label="Postal Code" value={read.postal_code || "—"} />
          <Field label="Country" value={read.country || "—"} />
          <Field label="Phone" value={read.phone || "—"} />
          <Field
            label="Website"
            value={
              read.website_url ? (
                <a
                  className="underline text-blue-700 break-all"
                  href={read.website_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {read.website_url}
                </a>
              ) : (
                "—"
              )
            }
          />
        </div>
      ) : (
        // EDIT MODE — form controls
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Brewery Name *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring focus:border-amber-500"
              placeholder="e.g., Lone Star Brewing Co."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Brewery Type</label>
            <select
              name="brewery_type"
              value={form.brewery_type}
              onChange={handleChange}
              className="w-full p-2 rounded-md border appearance-none border-gray-300 focus:outline-none focus:ring focus:border-amber-500"
            >
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-1">Street</label>
              <input
                name="street"
                value={form.street}
                onChange={handleChange}
                className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring focus:border-amber-500"
                placeholder="123 Main St"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">City *</label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring focus:border-amber-500"
                placeholder="Austin"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">State</label>
              <input
                name="state"
                value={form.state}
                onChange={handleChange}
                className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring focus:border-amber-500"
                placeholder="TX"
                maxLength={100}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Postal Code</label>
              <input
                name="postal_code"
                value={form.postal_code}
                onChange={handleChange}
                className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring focus:border-amber-500"
                placeholder="78704"
                maxLength={20}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Country *</label>
              <input
                name="country"
                value={form.country}
                onChange={handleChange}
                className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring focus:border-amber-500"
                placeholder="USA"
                required
                maxLength={100}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring focus:border-amber-500"
                placeholder="(555) 123‑4567"
                maxLength={20}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-1">Website</label>
              <input
                type="url"
                name="website_url"
                value={form.website_url}
                onChange={handleChange}
                className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring focus:border-amber-500"
                placeholder="https://www.mybrewery.com"
                maxLength={200}
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      )}
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <div className="text-xs font-semibold text-gray-500">{label}</div>
      <div className="text-sm md:text-base">{value}</div>
    </div>
  );
}
