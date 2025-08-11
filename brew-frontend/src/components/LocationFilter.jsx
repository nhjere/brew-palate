	import React, { useEffect, useState } from 'react';
	import "../index.css"

	export default function LocationFilter({ address, onAddressChange, distance, setDistance, onSearch }) {

	const [localDistance, setLocalDistance] = useState(distance);
	const [newAddress, setNewAddress] = useState(address);

	useEffect(() => {
		setLocalDistance(distance);
	}, [distance]);

	const handleConfirmAddress = () => {
		if (!newAddress || newAddress.length < 5) {
		alert("Please enter a more complete address.");
		return;
		}
		onAddressChange(newAddress);
	};


	return (
	<aside className="lg:col-span-3 bg-orange-50 p-4 rounded-2xl overflow-hidden border shadow-md transition-all">
	<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
		{/* Address */}
		<label className="flex items-center gap-2 text-[12px] font-semibold text-amber-900">
		Address:
		<input
			type="text"
			value={newAddress}
			onChange={(e) => setNewAddress(e.target.value)}
			className="w-64 rounded-full bg-white px-4 py-2 text-sm"
			placeholder="Enter your location"
		/>
		</label>

		{/* Distance */}
		<label className="flex items-center gap-2 text-[12px] font-semibold text-amber-900">
		Max Distance:
		<input
			type="number"
			value={localDistance}
			onChange={(e) => setLocalDistance(Number(e.target.value))}
			className="w-20 rounded-full bg-white px-3 py-2 text-sm text-center"
		/>
		<span className="text-[12px] text-amber-900">miles</span>
		</label>

		{/* Button */}
		<button
			onClick={() => {
				// validate
				if (!newAddress || newAddress.length < 5) {
				alert("Please enter a more complete address.");
				return;
				}

				// one-click: use the *typed* values
				onSearch(newAddress.trim(), localDistance);

				// sync parent state for future renders (these can run after)
				setDistance(localDistance);
				onAddressChange(newAddress.trim());
			}}
			className="ml-auto rounded-full px-5 py-2 text-sm bg-blue-200 text-black"
			>
			Search
			</button>
	</div>
	</aside>


	);
	}

