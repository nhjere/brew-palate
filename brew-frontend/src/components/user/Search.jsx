import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useBreweryMap } from "../../context/BreweryContext.jsx";
import searchIcon from "../../assets/search.svg";

const DEBOUNCE_MS = 250;

export default function Search({ value, onSearch }) {
  const [local, setLocal] = useState(value ?? "");
  const [open, setOpen] = useState(false);        // suggestions open
  const [expanded, setExpanded] = useState(false); // icon vs bar
  const [items, setItems] = useState([]);         // suggestions
  const [hi, setHi] = useState(-1);               // highlighted index

  const timer = useRef(null);
  const boxRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const breweryMap = useBreweryMap();
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  // keep local input in sync with parent
  useEffect(() => setLocal(value ?? ""), [value]);

  // click outside to close
  useEffect(() => {
    const h = (e) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target)) {
        setOpen(false);
        setExpanded(false);
      }
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
      onSearch?.(local);
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
    setExpanded(false);
  };

  const openSearch = () => {
    setExpanded(true);
    // focus after render
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const closeSearchIfEmpty = () => {
    if (!local.trim()) {
      setExpanded(false);
      setOpen(false);
    } else {
      setOpen(false);
    }
  };

  return (
    <div ref={boxRef} className="relative">
      {/* The pill that morphs from icon → full search bar */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => {
          if (!expanded) openSearch();
        }}
        onKeyDown={(e) => {
          if (!expanded && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            openSearch();
          }
        }}
        className={`
          flex items-center overflow-hidden rounded-full border border-transparent
             bg-[#fff4e6]
          transition-all duration-200 ease-out
          focus:outline-none focus:ring-0
          ${expanded ? "w-[24rem] max-w-[80vw] px-3 py-1.5" : "w-10 h-10 justify-center"}
        `}
      >
        {/* Magnifying glass icon (always visible) */}
        <img
          src={searchIcon}
          alt="Search beers"
          className={`
            h-4 w-10 shrink-0
            ${expanded ? "m-2" : ""}
          `}
        />

        {/* Input + Close text appear when expanded */}
        <div
          className={`
            flex items-center flex-1
            transition-all duration-200 ease-out
            ${expanded ? "opacity-100 ml-1" : "opacity-0 w-0 pointer-events-none"}
          `}
          onClick={(e) => e.stopPropagation()} // don't re-trigger open
        >
          <input
            ref={inputRef}
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
                e.preventDefault();
                closeSearchIfEmpty();
              }
            }}
            placeholder="Search beers… (not functional)"
            className="
              w-full bg-transparent text-sm
              text-[#8B4513] placeholder:text-[#9F9F9F]
              focus:outline-none focus:ring-0
            "
            aria-label="Search beers"
            role="combobox"
            aria-expanded={open}
            aria-controls="bp-search-list"
          />

          <button
            type="button"
            onClick={() => {
              if (local.trim()) {
                setLocal("");
                setItems([]);
                setOpen(false);
                inputRef.current?.focus();
              } else {
                setExpanded(false);
              }
            }}
            className="ml-2 text-xs font-medium text-[#A45A23] hover:text-[#7A3B06]"
          >
            {local.trim() ? "Clear" : "Close"}
          </button>
        </div>
      </div>

      {/* Suggestions dropdown – aligned under the expanded pill */}
      {expanded && open && items.length > 0 && (
        <ul
          id="bp-search-list"
          className="
            absolute left-0 mt-2
            w-[24rem] max-w-[80vw]
            z-50 max-h-80 overflow-auto rounded-xl
            border border-amber-200 bg-white shadow-lg
          "
          role="listbox"
        >
          {items.map((it, idx) => {
            const br = breweryMap[it.breweryUuid];
            const breweryName = br?.breweryName ?? "Unknown Brewery";

            return (
              <li
                key={`${it.beerId}`}
                role="option"
                aria-selected={idx === hi}
                onMouseEnter={() => setHi(idx)}
                className={`flex cursor-pointer items-center justify-between px-4 py-2 ${
                  idx === hi ? "bg-amber-50" : ""
                }`}
              >
                <Link
                  to={`/brewery/${it.breweryUuid}`}
                  className="min-w-0 flex-1"
                  onClick={() => {
                    setOpen(false);
                    setExpanded(false);
                  }}
                >
                  <div className="truncate text-[#7A3B06] font-medium">
                    {it.name}
                    <span className="mx-2 text-[#A45A23]">—</span>
                    <span className="text-[#A45A23]">{breweryName}</span>
                  </div>
                  <div className="truncate text-xs text-amber-600">
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
