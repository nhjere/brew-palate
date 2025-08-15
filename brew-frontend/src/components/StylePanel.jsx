import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function StylePanel({
  selectedStyles,
  setSelectedStyles,
  onRefresh,
  withShell = true,
}) {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const [availableStyles, setAvailableStyles] = useState([]);
  const [tempStyles, setTempStyles] = useState([]);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/import/styles`)
      .then((res) => setAvailableStyles(res.data || []))
      .catch((err) => console.error(err));
  }, []);

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
  };

  if (!withShell) {
    return (
      <div>
        <div className="text-amber-900">
          <p className="text-sm mb-2">Which styles are you looking for?</p>

          <ul className="space-y-2 text-sm">
            {availableStyles.map((style) => (
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

          <div className="flex justify-center pt-4">
            <button
              onClick={handleRefresh}
              className="bg-blue-200 hover:bg-blue-300 text-black font-bold py-1 px-4 rounded"
            >
              Set Styles
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If you ever render with shell=true, keep it simple (PanelShell provides the shell usually)
  return null;
}
