import React, { useEffect, useState } from 'react';
import axios from 'axios';

const POPULAR_STYLE_FAMILIES = ['Lager','Ale','IPA','Stout','Porter','Pilsner','Wheat','Belgian','Amber / Red','American'];

export default function StylePanel({selectedStyles,setSelectedStyles,onRefresh,withShell = true,}) {
	const BASE_URL = import.meta.env.VITE_BACKEND_URL;

	const [availableStyles, setAvailableStyles] = useState([]);
	const [tempStyles, setTempStyles] = useState([]);

	// initialize temp from committed
	useEffect(() => {
		setTempStyles(selectedStyles || []);
	}, [selectedStyles]);

	// updates temp styles on checklist change
	const handleStyleToggle = (style) => {
		setTempStyles((prev) =>
		prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
		);
	};

	// applies styles
	const handleApply = () => {
		setSelectedStyles(tempStyles);
		localStorage.setItem('userStyles', JSON.stringify(tempStyles));
		onRefresh?.(tempStyles);
	};


	useEffect(() => {
		axios
		.get(`${BASE_URL}/api/import/styles`)
		.then((res) => setAvailableStyles(res.data || []))
		.catch((err) => console.error(err));
	}, []);

	const handleStyleChange = (style) => {
		setTempStyles((prev) =>
		prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
		);
	};

	const handleRefresh = () => {
		setSelectedStyles(tempStyles);
		localStorage.setItem('userStyles', JSON.stringify(tempStyles));
		onRefresh?.(tempStyles);
		// Print each item in tempStyles
		tempStyles.forEach((style, idx) => {
			console.log(`Style ${idx}: ${style}`);
		});
	};

	if (!withShell) {
		return (
		<div className="text-amber-900 flex flex-col max-h-60 ">

			<p className="text-sm mb-2 shrink-0">Which styles are you looking for?</p>

			<ul className="space-y-2 text-sm overflow-y-auto pr-1 flex-1">
				{POPULAR_STYLE_FAMILIES.map((style) => (
				<label key={style} className="flex items-center space-x-2">
					<input
					type="checkbox"
					className="w-4 h-4 border-2 border-black rounded checked:bg-white checked:border-black focus:ring-0"
					checked={tempStyles.includes(style)}
					onChange={() => handleStyleChange(style)}
					/>
					<span>{style}</span>
				</label>
				))}
			</ul>

			<div className="pt-4 shrink-0">
			<button
				onClick={handleRefresh}
				className="w-full bg-blue-200 hover:bg-blue-300 text-black font-semibold py-2 rounded-md"
			>
				Set Styles
			</button>
			</div>
		</div>
		);
	}

	return null;
}
