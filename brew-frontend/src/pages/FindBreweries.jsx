import FullHeader from '../components/user/UserHeader';
import LocationFilter from '../components/user/LocationFilter';
import BreweryMap from '../components/user/BreweryMap';
import { useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import supabase from '../supabaseClient';

export default function FindBreweries() {
  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

  const location = useLocation();
  const [filteredBreweries, setFilteredBreweries] = useState([]);
  const [distance, setDistance] = useState(25);
  const [allBreweries, setAllBreweries] = useState([]);
  const [mapCenter, setMapCenter] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const queryParams = new URLSearchParams(location.search);

  const [address, setAddress] = useState('');
  const isFirstLoad = useRef(true);
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  // initial address / first load
  useEffect(() => {
    if (!isFirstLoad.current) return;
    const queryAddress = queryParams.get('address');
    const stored = localStorage.getItem('brew_address');
    const base = queryAddress || stored || 'Austin';
    isFirstLoad.current = false;
    refetchNearby(base, distance);
  }, []);

  const handleAddressChange = (newAddress) => {
    setAddress(newAddress);
    localStorage.setItem('brew_address', newAddress);
  };

  // unified nearby fetch
  const refetchNearby = async (overrideAddress, overrideRadius) => {
    const addr = overrideAddress ?? address;
    const radius = overrideRadius ?? distance;
    if (!addr) return;

    try {
      const geo = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          addr
        )}.json`,
        { params: { access_token: MAPBOX_TOKEN, autocomplete: true } }
      );
      const coords = geo.data.features[0]?.center;
      if (!coords) return;
      const [lng, lat] = coords;

      if (addr !== address) {
        setAddress(addr);
        localStorage.setItem('brew_address', addr);
      }

      setMapCenter({ lat, lng });
      setCurrentPage(1);

      const nearby = await axios.get(
        `${BASE_URL}/api/brewer/breweries/nearby`,
        { params: { lat, lng, radius } }
      );
      setFilteredBreweries(nearby.data);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  // pagination
  const breweriesPerPage = 8;
  const startIdx = (currentPage - 1) * breweriesPerPage;
  const currentPageBreweries = filteredBreweries.slice(
    startIdx,
    startIdx + breweriesPerPage
  );
  const totalPages = Math.ceil(filteredBreweries.length / breweriesPerPage);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-white flex flex-col">
      <FullHeader />

      {/* top filter bar – keep spacing, update palette */}
      <div className="px-4 md:px-8 pt-4">
        <LocationFilter
          address={address}
          onAddressChange={handleAddressChange}
          distance={distance}
          setDistance={setDistance}
          onSearch={(addr, rad) => refetchNearby(addr, rad)}
        />
      </div>

      {/* map + list – same grid/gaps as before */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 px-4 md:px-8 pb-8 mt-4">
        {/* MAP SIDE */}
        <section className="lg:col-span-3 w-full bg-[#f2f2f2] p-4 md:p-5 overflow-hidden border border-slate-200 shadow-sm transition-all">
          <h2 className="text-xl text-[#8C6F52] font-semibold  mb-3">Brewery Map</h2>
          {mapCenter && (
            <div className="overflow-hidden rounded-xl ring-1 ring-[#3C547A]/25">
              <BreweryMap breweries={filteredBreweries} center={mapCenter} />
            </div>
          )}
        </section>

        {/* LIST SIDE */}
        <section className="lg:col-span-2 bg-[#f2f2f2] p-4 md:p-5 overflow-hidden border border-slate-200 shadow-sm transition-all flex flex-col">
          <h2 className="text-xl text-[#8C6F52] font-semibold  mb-3">
            Nearby Breweries
          </h2>

          <div className="max-h-[560px] overflow-y-auto pr-1 custom-scrollbar">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-[#3C547A]">
                <tr className="text-white">
                  <th className="px-4 py-2 text-left font-semibold">Name</th>
                  <th className="px-4 py-2 text-right font-semibold">
                    Distance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {currentPageBreweries.map((b) => (
                  <tr
                    key={b.breweryId}
                    className="hover:bg-white/70 transition-colors"
                  >
                    <td className="px-4 py-2">
                      <a
                        href={`/brewery/${b.breweryId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#3C547A] font-medium hover:underline"
                      >
                        {b.breweryName}
                      </a>
                      <div className="text-[11px] text-slate-500">
                        {b.city && b.state ? `${b.city}, ${b.state}` : ''}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-right text-slate-700">
                      {b.distance ? `${b.distance.toFixed(1)} mi` : '—'}
                    </td>
                  </tr>
                ))}

                {currentPageBreweries.length === 0 && (
                  <tr>
                    <td
                      colSpan={2}
                      className="px-4 py-6 text-center text-slate-400 italic"
                    >
                      No breweries found for this search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* pagination – same placement, new colors */}
          <div className="mt-4 flex items-center justify-between text-sm text-[#8C6F52]">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="rounded-full px-4 py-2 ring-1 ring-[#8C6F52] bg-white text-[#8C6F52] disabled:opacity-40 hover:bg-[#f6eee7] transition-colors"
            >
              Prev
            </button>
            <span>
              Page {currentPage} of {totalPages || 1}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="rounded-full px-4 py-2 ring-1 ring-[#8C6F52] bg-white text-[#8C6F52] disabled:opacity-40 hover:bg-[#f6eee7] transition-colors"
            >
              Next
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
