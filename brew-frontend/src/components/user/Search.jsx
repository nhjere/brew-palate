import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
// adjust the path if needed:
import { useBreweryMap } from "../../context/BreweryContext.jsx";

const DEBOUNCE_MS = 250;

export default function Search({ value, onSearch }) {
  const [local, setLocal] = useState(value ?? "");
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);           // suggestions: BeerListItem[]
  const [hi, setHi] = useState(-1);                 // highlighted index for keyboard
  const timer = useRef(null);
  const boxRef = useRef(null);
  const navigate = useNavigate();
  const breweryMap = useBreweryMap();
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  // keep local input in sync with parent
  useEffect(() => setLocal(value ?? ""), [value]);

  // click outside to close
  useEffect(() => {
    const h = (e) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", h);
    return () => document.removeEventListener("pointerdown", h);
  }, []);

  // fetch suggestions (debounced)
  useEffect(() => {
    clearTimeout(timer.current);
    if (!local.trim()) {
      setItems([]);
      setOpen(false);
      onSearch?.(local);  // keep parent informed
      return;
    }

    timer.current = setTimeout(async () => {
      onSearch?.(local);
      try {
        const res = await axios.get(`${BASE_URL}/api/import/search/beers`, {
          params: { q: local.trim(), page: 0, size: 8 },
        });
        const rows = res?.data?.content ?? [];
        setItems(rows);
        setHi(rows.length ? 0 : -1);
        setOpen(true);
      } catch (err) {
        console.error("Search failed", err);
        setItems([]);
        setOpen(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer.current);
  }, [local]);

  const goToHighlighted = () => {
    if (hi < 0 || hi >= items.length) return;
    const it = items[hi];
    navigate(`/brewery/${it.breweryUuid}`);
    setOpen(false);
  };

  return (
    <div ref={boxRef} className="relative w-[28rem] max-w-full">
      <input
        type="text"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onFocus={() => items.length && setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHi((i) => Math.min(i + 1, items.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHi((i) => Math.max(i - 1, 0));
          } else if (e.key === "Enter") {
            e.preventDefault();
            goToHighlighted();
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        placeholder="Search beers…"
        className="w-full px-5 py-2.5 rounded-full bg-gray-100 placeholder:text-[#6F6F6F] shadow-inner focus:outline-none"
        aria-label="Search beers"
        role="combobox"
        aria-expanded={open}
        aria-controls="bp-search-list"
      />

      {open && items.length > 0 && (
        <ul
          id="bp-search-list"
          className="absolute left-0 right-0 mt-2 z-50 rounded-xl border border-amber-200 bg-white shadow-lg max-h-80 overflow-auto"
          role="listbox"
        >
          {items.map((it, idx) => {
            const br = breweryMap[it.breweryUuid];
            const breweryName = br?.breweryName ?? "Unknown Brewery";

            return (
              <li key={`${it.beerId}`}
                  role="option"
                  aria-selected={idx === hi}
                  onMouseEnter={() => setHi(idx)}
                  className={`px-4 py-2 cursor-pointer flex justify-between items-center ${
                    idx === hi ? "bg-amber-50" : ""
                  }`}>
                <Link
                  to={`/brewery/${it.breweryUuid}`}
                  className="flex-1 min-w-0"
                  onClick={() => setOpen(false)}
                >
                  <div className="truncate text-amber-900 font-medium">
                    {it.name}
                    <span className="mx-2 text-amber-700">—</span>
                    <span className="text-amber-700">{breweryName}</span>
                  </div>
                  <div className="text-xs text-amber-600 truncate">
                    {it.style || ""}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
