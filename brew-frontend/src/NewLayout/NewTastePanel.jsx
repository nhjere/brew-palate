import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "../index.css"
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid';

export default function NewTastePanel({ flavorTags, setFlavorTags, onRefresh }) {
    const [availableTags, setAvailableTags] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const BASE_URL = import.meta.env.VITE_BACKEND_URL;

    // Fetch available tags
    useEffect(() => {
        axios.get(`${BASE_URL}/api/import/flavor-tags`)
            .then(res => {
                setAvailableTags(res.data);
                const saved = JSON.parse(localStorage.getItem('userFlavorTags')) || [];
            })
            .catch(err => console.error(err));
    }, []);

    // Toggle checkbox
    const handleTagChange = (tag) => {
        setFlavorTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    // Save to local storage and notify parent
    const handleRefresh = () => {
        localStorage.setItem('userFlavorTags', JSON.stringify(flavorTags));
        console.log('Saved tags:', flavorTags);
        onRefresh();
    };

        return (
        <div className="w-full bg-white rounded-2xl overflow-hidden border shadow-md transition-all">
            {/* Top Bar (toggle) */}
            <div className="flex items-center justify-between px-4 py-2 text-xl font-semibold cursor-pointer"
                onClick={() => setIsOpen(prev => !prev)}
            >
                <span>Your Taste</span>
                {isOpen ? (
                    <ChevronUpIcon className="w-4 h-4 text-amber-900" />
                ) : (
                    <ChevronDownIcon className="w-4 h-4 text-amber-900" />
                )}
            </div>

            {/* Dropdown Section */}
            {isOpen && (
                <div className="px-4 pb-4 pt-2 text-amber-900 border-gray-400">
                    <p className="text-sm mb-2">Which flavors do you enjoy?</p>
                    <ul className="space-y-2 max-h-auto overflow-y-auto pr-1 text-sm">
                        {availableTags.map((tag) => (
                            <label key={tag} className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 border-2 border-black rounded checked:bg-white checked:border-black focus:ring-0"
                                    checked={flavorTags.includes(tag)}
                                    onChange={() => handleTagChange(tag)}
                                />
                                <span>{tag.charAt(0).toUpperCase() + tag.slice(1)}</span>
                            </label>
                        ))}
                    </ul>
                    <div className="flex justify-center pt-4">
                        <button
                            onClick={handleRefresh}
                            className="bg-blue-200 hover:bg-blue-300 text-black font-bold py-1 px-4 rounded"
                        >
                            Set Tags
                        </button>
                    </div>
                </div>
            )}
        </div>
    );

}
