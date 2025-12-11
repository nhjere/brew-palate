// StylePanel.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const POPULAR_STYLES = [
  'Lager',
  'Ale',
  'IPA',
  'Stout',
  'Porter',
  'Pilsner',
  'Wheat',
  'Belgian',
  'Amber / Red',
  'American',
];

export default function StylePanel({
  selectedStyles,
  setSelectedStyles,
  onRefresh,
  withShell = true,
}) {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const [availableStyles, setAvailableStyles] = useState([]);
  const [tempStyles, setTempStyles] = useState([]);

  // initialize temp from committed
  useEffect(() => {
    setTempStyles(selectedStyles || []);
  }, [selectedStyles]);

  const handleStyleChange = (style) => {
    setTempStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  };

  const handleRefresh = () => {
    setSelectedStyles(tempStyles);
    localStorage.setItem('userStyles', JSON.stringify(tempStyles));
    onRefresh?.(tempStyles);
    tempStyles.forEach((style, idx) => {
      console.log(`Style ${idx}: ${style}`);
    });
  };

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/import/styles`)
      .then((res) => setAvailableStyles(res.data || []))
      .catch((err) => console.error(err));
  }, []);

  if (!withShell) {
    return (
      <div className="text-[#8A5A3C] flex flex-col max-h-60">
        <p className="text-sm font-bold mb-2 shrink-0">
          Which styles do you enjoy?
        </p>

        <ul className="space-y-2 text-sm overflow-y-auto no-scrollbar pr-1 flex-1">
          {POPULAR_STYLES.map((style) => (
            <label key={style} className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="
                  w-4 h-4 
                  border-2 border-[#8A5A3C] 
                  rounded-sm 
                  bg-white 
                  checked:bg-[#3C547A] 
                  checked:border-[#3C547A] 
                  focus:ring-0
                  cursor-pointer
                "
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
            className="
              w-full 
              bg-[#8C6F52] 
              hover:bg-[#8c6f52af]
              text-white 
              font-semibold 
              py-2 
              rounded-md
            "
          >
            Set Styles
          </button>
        </div>
      </div>
    );
  }

  return null;
}
