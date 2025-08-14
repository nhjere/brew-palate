// NewTastePanel.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid';

export default function NewTastePanel({
	flavorTags,
	setFlavorTags,
	onRefresh,
	withShell = true,
}) 

{
const [availableTags, setAvailableTags] = useState([]);
const [isOpen, setIsOpen] = useState(true);
const BASE_URL = import.meta.env.VITE_BACKEND_URL;
const [tempTags, setTempTags] = useState([]);

useEffect(() => {
	axios.get(`${BASE_URL}/api/import/flavor-tags`)
	.then(res => setAvailableTags(res.data || []))
	.catch(err => console.error(err));
}, []);

const handleTagChange = (tag) => {
	setTempTags(prev =>
	prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
	);
};

useEffect(() => {
	setTempTags(flavorTags);
}, [flavorTags]);

const handleRefresh = () => {
	setFlavorTags(tempTags)
	localStorage.setItem('userFlavorTags', JSON.stringify(tempTags));
	onRefresh?.(tempTags);
};

if (!withShell) {
	return (
	<div>
		<div className="text-amber-900">
		<p className="text-sm mb-2">Which flavors do you enjoy?</p>
			
		<ul className="space-y-2 text-sm">
			{availableTags.map(tag => (
			<label key={tag} className="flex items-center space-x-2">
				<input
				type="checkbox"
				className="w-4 h-4 border-2 border-black rounded checked:bg-white checked:border-black focus:ring-0"
				checked={tempTags.includes(tag)}
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
	</div>
	);
}
}