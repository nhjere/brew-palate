import React, { useState } from 'react';
import axios from 'axios';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid';

export default function BeerProximity({ committedTags, onSetProximity }) {
const [address, setAddress] = useState('');
const [distance, setDistance] = useState(25);
const [isOpen, setIsOpen] = useState(true);

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const handleNearbyBeerSearch = async () => {
	try {
	const geo = await axios.get(
		`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`,
		{ params: { access_token: MAPBOX_TOKEN } }
	);

	const [lng, lat] = geo.data.features[0].center;

	await axios.get(`${BASE_URL}/api/import/filtered-all-beers`, {
		params: {
		lat,
		lng,
		radius: distance,
		tags: committedTags
		},
		paramsSerializer: params => new URLSearchParams(params).toString()
	});

	onSetProximity({ lat, lng, radius: distance });
	} catch (err) {
	console.error("Error fetching nearby beers:", err);
	}
};

	return (
		<div className="w-full bg-white rounded-2xl overflow-hidden border shadow-md transition-all">
		{/* Toggle */}
		<div
			className="flex items-center justify-between px-4 py-2 text-xl font-semibold cursor-pointer"
			onClick={() => setIsOpen(prev => !prev)}
		>
			<span>Location</span>
			{isOpen ? (
				<ChevronUpIcon className="w-4 h-4 text-amber-900" />
			) : (
				<ChevronDownIcon className="w-4 h-4 text-amber-900" />
			)}
		</div>

		{/* Content */}
		{isOpen && (
			<div className="px-4 pb-4 pt-1 text-amber-900">
			<div className="flex flex-col gap-4 w-full">
				{/* Address */}
				<label className="w-full">
				<span className="block text-sm font-medium text-gray-800 mb-1">Address</span>
				<input
					type="text"
					className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm placeholder:text-gray-400 focus:outline-none"
					value={address}
					placeholder="Enter Address, City, State"
					onChange={(e) => setAddress(e.target.value)}
				/>
				</label>

				{/* Radius */}
				<label className="w-full">
				<span className="block text-sm font-medium text-gray-800 mb-1">Radius (miles)</span>
				<input
					type="number"
					min={1}
					className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-center focus:outline-none"
					value={distance}
					onChange={(e) => setDistance(Number(e.target.value))}
				/>
				</label>

				{/* Action */}
				<button
				type="button"
				onClick={handleNearbyBeerSearch}
				className="w-full bg-blue-200 hover:bg-blue-300 text-black font-semibold py-2 rounded-md"
				>
				Search Nearby Beers
				</button>
			</div>
			</div>
		)}
		</div>
	);
}
