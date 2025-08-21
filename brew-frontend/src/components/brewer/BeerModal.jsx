import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { useBreweryMap } from '../../context/BreweryContext';


export default function BeerModal({ onClose, onReviewSubmit}) {
    const [beer, setBeer] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const breweryMap = useBreweryMap();
    const BASE_URL = import.meta.env.VITE_BACKEND_URL;
    
    const [reviewFormData, setReviewFormData] = useState({
        beerName: '',
        beerStyle: '',
        abv: 1,
        ibu: 1,
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
        // If beer has tags, preselect; otherwise keep user’s current selection
        flavorTags: Array.isArray(beer.flavorTags) ? beer.flavorTags : prev.flavorTags,
        }));
    }, [beer]);

    // Generic field change (text/number)
    const handleFieldChange = (e) => {
        const { name, value } = e.target;
        setReviewFormData(prev => ({
        ...prev,
        [name]: name === 'abv' || name === 'ibu' ? Number(value) : value,
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

    
    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex flex-col md:items-center md:justify-center">
            <div className="bg-white text-amber-800 relative w-full h-auto p-4 rounded-none overflow-auto 
                            md:w-[720px] md:h-[60vh] md:rounded-2xl md:p-6 md:shadow-lg">


                <h2 className='text-2xl mb-5 font-bold amber-900'> New Beer </h2>
                <button className="absolute top-2 right-2 text-gray-500 hover:text-red-500" onClick={onClose} > ✕ </button>


                <form className="space-y-4">

                    <div>
                        <label className="block text-lg font-semibold mb-1">Beer Name</label>
                        <input
                        type="text"
                        name="beerName"
                        value={reviewFormData.beerName}
                        onChange={handleFieldChange}
                        className="w-full border border-gray-300 rounded p-2"
                        placeholder="e.g., Hazy Daydream"
                        />
                    </div>

                    <div>
                        <label className="block text-lg font-semibold mb-1">Style</label>
                        <input
                        type="text"
                        name="beerStyle"
                        value={reviewFormData.beerStyle}
                        onChange={handleFieldChange}
                        className="w-full border border-gray-300 rounded p-2"
                        placeholder="e.g., New England IPA"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                        <label className="block text-lg font-semibold mb-1">ABV (%)</label>
                        <input
                            type="number"
                            name="abv"
                            min={0}
                            max={100}
                            step={0.1}
                            value={reviewFormData.abv}
                            onChange={handleFieldChange}
                            className="w-full border border-gray-300 rounded p-2"
                        />
                        </div>
                        <div>
                        <label className="block text-lg font-semibold mb-1">IBU</label>
                        <input
                            type="number"
                            name="ibu"
                            min={0}
                            max={120}
                            step={1}
                            value={reviewFormData.ibu}
                            onChange={handleFieldChange}
                            className="w-full border border-gray-300 rounded p-2"
                        />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Flavor Tags</label>
                        <div className="flex flex-wrap gap-2">
                        {['citrus','hoppy','malty','roasty','tart','fruity','piney','floral'].map(tag => {
                            const active = reviewFormData.flavorTags.includes(tag);
                            return (
                                <label key={tag} className="flex items-center space-x-2 text-sm">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 border-2 border-black rounded checked:bg-white checked:border-black focus:ring-0"
                                        checked={reviewFormData.flavorTags.includes(tag)}
                                        onChange={() => handleTagToggle(tag)}
                                    />
                                    <span>{tag}</span>
                                </label>
                            );
                        })}
                        </div>
                    </div>

                    <button className="bg-blue-200 hover:bg-blue-300 text-black px-4 py-1 rounded-full font-semibold">
                        Submit Beer
                    </button>


                </form>

            </div>
        </div>
    );
}