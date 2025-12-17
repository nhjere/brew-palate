import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function BeerModal({ onClose, onReviewSubmit, breweryId, token }) {
  const [beer, setBeer] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const [reviewFormData, setReviewFormData] = useState({
    beerName: '',
    beerStyle: '',
    abv: 1,
    ibu: 1,
    price: 0,
    flavorTags: [],
  });

  useEffect(() => {
    if (!beer) return;
    setReviewFormData(prev => ({
      ...prev,
      beerName: beer.name ?? '',
      beerStyle: beer.style ?? '',
      abv: typeof beer.abv === 'number' ? beer.abv : 0,
      ibu: typeof beer.ibu === 'number' ? beer.ibu : 0,
      price: typeof beer.price === 'number' ? beer.price : 0,
      flavorTags: Array.isArray(beer.flavorTags) ? beer.flavorTags : prev.flavorTags,
    }));
  }, [beer]);

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    const numericFields = new Set(['abv', 'ibu', 'price']);
    setReviewFormData(prev => ({
      ...prev,
      [name]: numericFields.has(name) ? Number(value) : value,
    }));
  };

  const handleTagToggle = (tag) => {
    setReviewFormData(prev => {
      const exists = prev.flavorTags.includes(tag);
      return {
        ...prev,
        flavorTags: exists
          ? prev.flavorTags.filter(t => t !== tag)
          : [...prev.flavorTags, tag],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const abvPercent = Number(reviewFormData.abv) || 0;

      const payload = {
        name: reviewFormData.beerName.trim(),
        style: reviewFormData.beerStyle,
        abv: Math.max(0, Math.min(abvPercent / 100, 1)),
        ibu: Number(reviewFormData.ibu) || 0,
        price: Number(reviewFormData.price) || 0,
        flavorTags: reviewFormData.flavorTags,
        breweryUuid: breweryId,
      };

      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

      const { data } = await axios.post(
        `${BASE_URL}/api/brewer/breweries/create/beer`,
        payload,
        { headers }
      );

      setSuccessMessage('Beer created!');
      onReviewSubmit?.(data);
      onClose?.();
    } catch (err) {
      console.error(err);
      setErrorMessage(err?.response?.data?.message || 'Failed to create beer');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex flex-col md:items-center md:justify-center">
      <div className="
        bg-white text-slate-900 relative w-full h-auto p-4 overflow-auto
        md:w-[720px] md:h-[75vh] md:p-6 md:shadow-lg md:border md:border-slate-200
        custom-scrollbar
      ">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-5 border-b border-slate-200 pb-3">
          <h2 className="text-2xl font-bold text-[#8C6F52]">New Beer</h2>
          <button
            className="text-slate-500 hover:text-slate-800 text-xl"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>

          {/* BASICS */}
          <div className="border border-slate-200 bg-[#f7f5f2] p-4">
            <h3 className="text-sm font-semibold text-[#8C6F52] mb-3 tracking-wide">BASICS</h3>

            {/* Beer Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">
                Beer Name *
              </label>
              <input
                type="text"
                name="beerName"
                value={reviewFormData.beerName}
                onChange={handleFieldChange}
                maxLength={64}
                required
                className="w-full p-2 border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3C547A]/30"
                placeholder="e.g., Hazy Daydream"
              />
            </div>

            {/* Style */}
            <div className="mt-4">
              <label className="block text-sm font-semibold text-slate-800 mb-1">Style *</label>
              <select
                name="beerStyle"
                value={reviewFormData.beerStyle}
                onChange={handleFieldChange}
                required
                className="w-full p-2 border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3C547A]/30"
              >
                <option value="">Select a style...</option>

                {[
                  'Lager','Ale','IPA','Stout','Porter','Pilsner',
                  'Wheat','Belgian','Amber / Red','American'
                ].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}

              </select>
            </div>
          </div>

          {/* SPECS */}
          <div className="border border-slate-200 bg-[#f7f5f2] p-4">
            <h3 className="text-sm font-semibold text-[#8C6F52] mb-3 tracking-wide">SPECS</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* ABV */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">ABV</label>
                <div className="flex shadow-sm">
                  <input
                    type="number"
                    name="abv"
                    min={0}
                    max={100}
                    step={0.1}
                    value={reviewFormData.abv}
                    onChange={handleFieldChange}
                    className="w-full p-2 border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3C547A]/30"
                    placeholder="6.5"
                  />
                  <span className="inline-flex items-center px-3 border border-l-0 border-slate-300 bg-slate-50 text-slate-600 text-sm">%</span>
                </div>
              </div>

              {/* IBU */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">IBU</label>
                <input
                  type="number"
                  name="ibu"
                  min={0}
                  max={120}
                  step={1}
                  value={reviewFormData.ibu}
                  onChange={handleFieldChange}
                  className="w-full p-2 border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3C547A]/30"
                  placeholder="20"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1">Price</label>
                <div className="flex shadow-sm">
                  <span className="inline-flex items-center px-3 border border-slate-300 bg-slate-50 text-slate-600 text-sm">$</span>
                  <input
                    type="number"
                    name="price"
                    min={0}
                    step={0.01}
                    value={reviewFormData.price}
                    onChange={handleFieldChange}
                    className="w-full p-2 border border-l-0 border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3C547A]/30"
                    placeholder="6.50"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* FLAVOR TAGS */}
          <div className="border border-slate-200 bg-[#f7f5f2] p-4">
            <h3 className="text-sm font-semibold text-[#8C6F52] mb-3 tracking-wide">
              FLAVOR TAGS
            </h3>

            <div className="flex flex-wrap gap-2">

              {[
                'Bitter','Boozy','Clean','Crisp','Dry','Fruity','Hoppy','Light',
                'Malty','Refreshing','Roasty','Sessionable','Smooth','Sour',
                'Spicy','Strong','Summer','Sweet','Winter'
              ].map(tag => {
                const active = reviewFormData.flavorTags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`
                      px-3 py-1 border !text-xs tracking-wide transition
                      ${
                        active
                          ? "bg-[#3C547A] text-white border-[#3C547A]"
                          : "bg-white text-slate-800 border-slate-300 hover:bg-[#f3f0ea]"
                      }
                    `}
                  >
                    {tag}
                  </button>
                );
              })}

            </div>

            <p className="mt-2 text-xs text-slate-500">
              {reviewFormData.flavorTags.length} selected
            </p>
          </div>

          {/* ERROR / SUCCESS */}
          {errorMessage && (
            <p className="text-red-600 text-sm">{errorMessage}</p>
          )}
          {successMessage && (
            <p className="text-green-700 text-sm">{successMessage}</p>
          )}

          {/* ACTION BAR */}
          <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm border border-slate-200 px-4 py-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 border border-[#8C6F52]/40 bg-white text-[#8C6F52] text-sm font-semibold hover:bg-[#e6e2dd]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-[#3C547A] text-white text-sm font-semibold hover:bg-[#314466] disabled:opacity-60"
            >
              {saving ? "Saving…" : "Submit Beer"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
