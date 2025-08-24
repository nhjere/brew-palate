import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { useBreweryMap } from '../../context/BreweryContext';


export default function BeerModal({ onClose, onReviewSubmit}) {
    const [beer, setBeer] = useState(null);
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    
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

    // Generic field change (text/number)
    const handleFieldChange = (e) => {
        const { name, value } = e.target;
        const numericFields = new Set(['abv', 'ibu', 'price']);
        setReviewFormData(prev => ({
        ...prev,
        [name]: numericFields.has(name) ? Number(value) : value,
        }));
    };

    // handler for flavor tags
    const handleTagToggle = (tag) => {
        setReviewFormData(prev => {
            const newTags = prev.flavorTags.includes(tag)
            ? prev.flavorTags.filter(t => t !== tag)
            : [...prev.flavorTags, tag];
            return { ...prev, flavorTags: newTags };
        });
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      if (!breweryId) throw new Error('Missing breweryId');

      const payload = {
        name: reviewFormData.beerName,
        style: reviewFormData.beerStyle,
        abv: Number(reviewFormData.abv) || 0,
        ibu: Number(reviewFormData.ibu) || 0,
        price: Number(reviewFormData.price) || 0,
        flavorTags: reviewFormData.flavorTags,
        breweryUuid: breweryId,
      };

      const { data } = await axios.post(`${BASE_URL}/api/brewer/beers`, payload);

      setSuccessMessage('Beer created!');
      onCreated?.(data);
      onReviewSubmit?.(data);   // if you still use this in parent
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
      <div className="bg-white text-amber-800 relative w-full h-auto p-4 rounded-none overflow-auto 
                      md:w-[720px] md:h-[75vh] md:rounded-2xl md:p-6 md:shadow-lg">
        <h2 className="text-2xl mb-5 font-bold text-amber-900">New Beer</h2>
        <button className="absolute top-2 right-2 text-gray-500 hover:text-red-500" onClick={onClose}>✕</button>

        <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Section: Basics */}
            <div className="rounded-xl border border-gray-200 bg-white/60 p-4">
                <h3 className="text-sm font-semibold text-amber-900 mb-3">Basics</h3>

                {/* Beer Name */}
                <div className="col-span-2">
                <label className="block text-sm font-semibold mb-1">Beer Name *</label>
                <input
                    type="text"
                    name="beerName"
                    value={reviewFormData.beerName}
                    onChange={handleFieldChange}
                    maxLength={64}
                    className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring focus:border-amber-500"
                    placeholder="e.g., Hazy Daydream"
                    required
                    aria-describedby="name-help"
                />
                <div id="name-help" className="mt-1 text-xs text-gray-500 flex justify-between">
                    <span>Make it distinct and consumer‑friendly.</span>
                    <span>{reviewFormData.beerName?.length || 0}/64</span>
                </div>
                </div>

                {/* Style + Quick Picks */}
                <div className="mt-4">
                    <div className="mt-4 w-full">
                    <label className="block text-sm font-semibold mb-1">Style *</label>
                    <select
                        name="beerStyle"
                        value={reviewFormData.beerStyle}
                        onChange={handleFieldChange}
                        className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring focus:border-amber-500"
                        required
                    >
                        <option value="">Select a style...</option>
                        {[
                        "Lager","Ale","IPA","Stout","Porter","Pilsner","Wheat","Belgian","Amber / Red","American"
                        ].map(style => (
                        <option key={style} value={style}>
                            {style}
                        </option>
                        ))}
                    </select>
                    </div>

                </div>
            </div>

            {/* Section: Specs */}
            <div className="rounded-xl border border-gray-200 bg-white/60 p-4">
                <h3 className="text-sm font-semibold text-amber-900 mb-3">Specs</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* ABV with % adornment */}
                <div>
                    <label className="block text-sm font-semibold mb-1">ABV</label>
                    <div className="flex rounded-md shadow-sm">
                    <input
                        type="number"
                        name="abv"
                        min={0}
                        max={100}
                        step={0.1}
                        value={reviewFormData.abv}
                        onChange={handleFieldChange}
                        className="w-full p-2 rounded-l-md border border-gray-300 focus:outline-none focus:ring focus:border-amber-500"
                        placeholder="6.5"
                        aria-describedby="abv-help"
                    />
                    <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-600 text-sm">%</span>
                    </div>
                    <p id="abv-help" className="mt-1 text-xs text-gray-500">Typical: 4–10%</p>
                </div>

                {/* IBU */}
                <div>
                    <label className="block text-sm font-semibold mb-1">IBU</label>
                    <input
                    type="number"
                    name="ibu"
                    min={0}
                    max={120}
                    step={1}
                    value={reviewFormData.ibu}
                    onChange={handleFieldChange}
                    className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring focus:border-amber-500"
                    placeholder="20"
                    aria-describedby="ibu-help"
                    />
                    <p id="ibu-help" className="mt-1 text-xs text-gray-500">Bitterness scale (higher = more bitter)</p>
                </div>

                {/* Price with $ adornment */}
                <div>
                    <label className="block text-sm font-semibold mb-1">Price</label>
                    <div className="flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-gray-300 bg-gray-50 text-gray-600 text-sm">$</span>
                    <input
                        type="number"
                        name="price"
                        min={0}
                        step={0.01}
                        inputMode="decimal"
                        value={reviewFormData.price ?? 0}
                        onChange={handleFieldChange}
                        className="w-full p-2 rounded-r-md border border-l-0 border-gray-300 focus:outline-none focus:ring focus:border-amber-500"
                        placeholder="6.50"
                        aria-describedby="price-help"
                    />
                    </div>
                    <p id="price-help" className="mt-1 text-xs text-gray-500">Per pour / can (USD)</p>
                </div>
                </div>
            </div>

            {/* Section: Flavor Tags */}
            <div className="rounded-xl border border-gray-200 bg-white/60 p-4">
                <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-amber-900">Flavor Tags</h3>
                <div className="flex items-center gap-2">
                    <button
                    type="button"
                    onClick={() => {
                        const all = ["Bitter","Boozy","Clean","Crisp","Dry","Fruity","Hoppy","Light","Malty","Refreshing","Roasty","Sessionable","Smooth","Sour","Spicy","Strong","Summer","Sweet","Winter"];
                        // toggle select-all vs clear based on current selection
                        if ((reviewFormData.flavorTags?.length || 0) < all.length) {
                        // select all
                        handleFieldChange({ target: { name: "flavorTags", value: all } });
                        } else {
                        // clear all
                        handleFieldChange({ target: { name: "flavorTags", value: [] } });
                        }
                    }}
                    className="text-xs px-2 py-1 rounded-full border border-gray-300 hover:bg-amber-50"
                    >
                    {(reviewFormData.flavorTags?.length || 0) > 0 ? "Clear all" : "Select all"}
                    </button>
                </div>
                </div>

                {/* Search/filter input for tags */}

                <div id="tag-container" className="flex flex-wrap gap-2">
                {[
                    "Bitter","Boozy","Clean","Crisp","Dry","Fruity","Hoppy","Light",
                    "Malty","Refreshing","Roasty","Sessionable","Smooth","Sour",
                    "Spicy","Strong","Summer","Sweet","Winter"
                ].map(tag => {
                    const active = reviewFormData.flavorTags.includes(tag);
                    return (
                    <button
                        type="button"
                        data-tag={tag.toLowerCase()}
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        className={`px-3 py-1 rounded-full border text-sm transition
                        ${active
                            ? "bg-amber-800 text-white border-amber-900 shadow-sm"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-amber-50"
                        }`}
                    >
                        {tag}
                    </button>
                    );
                })}
                </div>

                {/* Selected count */}
                <p className="mt-2 text-xs text-gray-500">
                {reviewFormData.flavorTags.length} selected
                </p>
            </div>

            {/* Messages */}
            {errorMessage && <p className="text-red-600 text-sm">{errorMessage}</p>}
            {successMessage && <p className="text-green-700 text-sm">{successMessage}</p>}

            {/* Sticky action bar */}
            <div className="sticky bottom-0 bg-white/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur rounded-xl border border-gray-200 p-3 flex items-center justify-end gap-2">
                <button
                type="button"
                onClick={onClose}
                className="px-4 py-1 rounded-full border border-gray-300 hover:bg-gray-50"
                >
                Cancel
                </button>
                <button
                type="submit"
                className="bg-blue-200 hover:bg-blue-300 disabled:opacity-60 text-black px-4 py-1 rounded-full font-semibold"
                disabled={saving}
                >
                {saving ? "Saving…" : "Submit Beer"}
                </button>
            </div>
            </form>



      </div>
    </div>
  );
};