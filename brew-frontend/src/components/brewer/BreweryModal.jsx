import { useState } from 'react';
import brewery_barrel from '../../assets/brewery_barrel.png'
import supabase from '../../supabaseClient.js';
import axios from 'axios';

export default function BreweryModal({ onClose, onSaved }) {
  const [form, setForm] = useState({
    brewery_name: "",
    brewery_type: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    street: "",
    latitude: "", 
    longitude: "", 
    phone: "",
    website_url: "",
    existing_brewery: "",
  });

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  // UI form -> backend DTO
  const toBreweryDTO = (f) => ({
    name: f.brewery_name,
    brewery_type: f.brewery_type || null,
    street: f.street || null,
    city: f.city,
    state: f.state || null,
    postal_code: f.postal_code || null,
    country: f.country,
    phone: f.phone || null,
    website_url: f.website_url || null,
    // latitude/longitude intentionally omitted (backend will leave null)
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // basic requireds
      if (!form.brewery_name || !form.brewery_type || !form.city || !form.country) {
        setErrorMessage("Brewery name, type, city, and country are required.");
        setSaving(false);
        return;
      }

      // ★ get current user id for X-User-Id header
    const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      if (!accessToken) {
        setErrorMessage("Please sign in first.");
        setSaving(false);
        return;
      }

      const payload = toBreweryDTO(form);
      await axios.post(
        `${BASE_URL}/api/brewer/breweries/create`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setSuccessMessage('Brewery created successfully!');
      onSaved?.();
      onClose?.();
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data || 'Failed to create brewery.';
      setErrorMessage(typeof msg === 'string' ? msg : 'Failed to create brewery.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex flex-col md:items-center md:justify-center">
      <div className="bg-white text-amber-800 relative w-full h-auto p-4 rounded-none overflow-auto custom-scrollbar
                      md:w-[720px] md:h-[60vh] md:rounded-2xl md:p-6 md:shadow-lg">
        <button
          type="button"
          className="absolute top-2 right-2 z-20 text-gray-500 hover:text-red-500"
          onClick={onClose}
        >
          ✕
        </button>

        <div className="relative z-10 space-y-8">

          {/* Claim Brewery Section */}
          <section className='overflow-y-auto custom-scrollbar'>
            <h2 className='text-2xl mb-5 font-bold amber-900 pb-2'> Already see your brewery? </h2>

            <label className="block text-sm font-semibold mb-1">
              Request Access for a Brewery and BrewPalate will email you approval
            </label>
            <div className='flex flex-row gap-3'>
              <input
                type="text"
                name="existing_brewery"
                value={form.existing_brewery}
                onChange={(e) => setForm({ ...form, existing_brewery: e.target.value })}
                className="flex-1 w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring focus:border-amber-500"
                placeholder="Find Your Brewery"
                // ★ not required for this flow
              />
              <button
                type="button"
                className="bg-blue-200 hover:bg-blue-300 text-black px-5 py-2 rounded-full font-semibold"
              >
                Request Access
              </button>
            </div>
          </section>

          {/* Divider */}
          <div className="border-t border-gray-300"></div>

          <section>
            <div className="pointer-events-none absolute inset-0 z-0 opacity-10">
              <img src={brewery_barrel} alt="" className="w-full h-full object-cover" />
            </div>

            <h2 className='text-2xl mb-5 font-bold amber-900'> New Brewery </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="col-span-2">
                <label className="block text-sm font-semibold mb-1">Brewery Name *</label>
                <input
                  type="text"
                  name="brewery_name"
                  value={form.brewery_name}
                  onChange={(e) => setForm({ ...form, brewery_name: e.target.value })}
                  className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring focus:border-amber-500"
                  placeholder="e.g., Lone Star Brewing Co."
                  required
                />
              </div>

              {/* Brewery Type */}
              <div className="col-span-2">
                <label className="block text-sm font-semibold mb-1">Brewery Type *</label>
                <select
                  name="brewery_type"
                  value={form.brewery_type}
                  onChange={(e) => setForm({ ...form, brewery_type: e.target.value })}
                  className="w-full p-2 rounded-md border appearance-none border-gray-300 focus:outline-none focus:ring focus:border-amber-500"
                  required
                >
                  <option value="">Select a type...</option>
                  <option value="micro">Micro – Most craft breweries</option>
                  <option value="nano">Nano – Extremely small, local distribution</option>
                  <option value="regional">Regional – Expanded regional location</option>
                  <option value="brewpub">Brewpub – Restaurant/bar with brewery on-premise</option>
                  <option value="planning">Planning – In planning, not yet open</option>
                </select>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-semibold mb-1">City *</label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring focus:border-amber-500"
                  placeholder="e.g., Austin"
                  required
                />
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-semibold mb-1">State</label>
                <input
                  type="text"
                  name="state"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring focus:border-amber-500"
                  placeholder="e.g., TX"
                />
              </div>

              {/* Postal Code */}
              <div>
                <label className="block text-sm font-semibold mb-1">Postal Code</label>
                <input
                  type="text"
                  name="postal_code"
                  value={form.postal_code}
                  onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
                  className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring focus:border-amber-500"
                  placeholder="e.g., 78704"
                />
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-semibold mb-1">Country *</label>
                <input
                  type="text"
                  name="country"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring focus:border-amber-500"
                  placeholder="e.g., USA"
                  required
                />
              </div>

              {/* Street */}
              <div className="col-span-2">
                <label className="block text-sm font-semibold mb-1">Street</label>
                <input
                  type="text"
                  name="street"
                  value={form.street}
                  onChange={(e) => setForm({ ...form, street: e.target.value })}
                  className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring focus:border-amber-500"
                  placeholder="e.g., 123 Main St"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold mb-1">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring focus:border-amber-500"
                  placeholder="(555) 123-4567"
                />
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-semibold mb-1">Website</label>
                <input
                  type="url"
                  name="website_url"
                  value={form.website_url}
                  onChange={(e) => setForm({ ...form, website_url: e.target.value })}
                  className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring focus:border-amber-500"
                  placeholder="https://www.mybrewery.com"
                />
              </div>

              {errorMessage && <p className="text-red-600 text-sm">{errorMessage}</p>}
              {successMessage && <p className="text-green-700 text-sm">{successMessage}</p>}

              <button
                type="submit"
                disabled={saving}
                className="bg-blue-200 hover:bg-blue-300 disabled:opacity-60 text-black px-4 py-1 rounded-full font-semibold"
              >
                {saving ? 'Saving…' : 'Save Brewery'}
              </button>
            </form>
          </section>

        </div>
      </div>
    </div>
  );
}
