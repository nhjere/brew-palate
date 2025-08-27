import BrewerHeader from '../../components/brewer/BrewerHeader';
import BeerModal from '../../components/brewer/BeerModal';
import BreweryModal from '../../components/brewer/BreweryModal';
import BreweryCard from '../../components/brewer/BreweryCard.jsx';
import { useEffect, useState, useMemo } from 'react';
import supabase from '../../supabaseClient.js';
import axios from 'axios';
import brewery_barrel from '../../assets/brewery_barrel.png'


export default function BrewerDashboard() {
    const [showBeerModal, setShowBeerModal] = useState(false);
    const [showBreweryModal, setShowBreweryModal] = useState(false);
    const [status, setStatus] = useState({ hasBrewery: false, brewery: null });
    const [refresh, setRefresh] = useState(false);
    const [token, setToken] = useState('');
    const [beers, setBeers] = useState([]);
    const [loadingBeers, setLoadingBeers] = useState(false);

    const BASE_URL = import.meta.env.VITE_BACKEND_URL;

    // Fetch auth + brewery status
    useEffect(() => {
        (async () => {
        const { data: { session } } = await supabase.auth.getSession();
        const accessToken = session?.access_token || '';
        setToken(accessToken);
        if (!accessToken) {
            setStatus({ hasBrewery: false, brewery: null });
            setBeers([]);
            return;
        }

        try {
            const { data } = await axios.get(
            `${BASE_URL}/api/brewer/breweries/status`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            setStatus(data);
        } catch (e) {
            console.error('Failed to fetch brewery status', e);
            setStatus({ hasBrewery: false, brewery: null });
        }
        })();
    }, [BASE_URL, refresh]);

    const breweryUuid = useMemo(
        () => status?.brewery?.breweryId || status?.brewery?.id || null,
        [status]
    );

    // Fetch beers for this brewery
    useEffect(() => {
        const run = async () => {
        if (!token || !status.hasBrewery || !breweryUuid) {
            setBeers([]);
            return;
        }
        try {
            setLoadingBeers(true);
            const { data } = await axios.get(`${BASE_URL}/api/import/by-brewery/${breweryUuid}`);
            setBeers(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error('Failed to fetch beers', e);
            setBeers([]);
        } finally {
            setLoadingBeers(false);
        }
        };
        run();
    }, [token, status, breweryUuid, BASE_URL, refresh]);

    const afterSave = () => setRefresh((p) => !p);
    const afterBeerCreated = () => {
        setShowBeerModal(false);
        setRefresh((p) => !p); // refetch beers
    };

    return (
        <div className="min-h-screen w-full overflow-x-hidden bg-[#fff4e6] flex flex-col
                        pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
        <BrewerHeader />

        <div className="flex flex-col gap-5 w-full p-5">
            {/* Your Brewery */}
            <section className="w-full bg-white p-4 rounded-2xl overflow-hidden border shadow-md transition-all">
            {status.hasBrewery && status.brewery ? (
                <div className="flex items-start justify-between gap-4">
                <BreweryCard brewery={status.brewery} token={token} onSaved={afterSave} />
                </div>
            ) : (
                <div className="flex items-center justify-between">
                <p className="text-amber-900 italic font-semibold">
                    Create a Brewery to begin adding / removing beers
                </p>
                <button
                    className="bg-blue-200 hover:bg-blue-300 text-black px-4 py-1 rounded-full font-semibold"
                    onClick={() => setShowBreweryModal(true)}
                >
                    Create My Brewery
                </button>
                </div>
            )}
            </section>

            {/* Beer Catalog */}

            <section className="w-full bg-white rounded-2xl p-4 overflow-hidden border shadow-md transition-all">
                <main className="flex flex-row gap-5 w-full items-center">
                    <h2 className="text-2xl font-bold p-4 text-amber-900">Beer Catalog</h2>

                    <button
                    className="ml-auto bg-blue-200 hover:bg-blue-300 text-black px-4 py-1 rounded-full font-semibold disabled:opacity-60"
                    onClick={() => setShowBeerModal(true)}
                    disabled={!status.hasBrewery}
                    title={!status.hasBrewery ? 'Create your brewery first' : ''}
                    >
                    Add a Beer
                    </button>

                </main>

                {/* Only render the table area if a brewery exists.
                    Otherwise render nothing here (no duplicate message). */}
                {status.hasBrewery && status.brewery && (
                    <section className="lg:col-span-2 w-full p-4 overflow-hidden shadow-sm rounded-xl border border-amber-900/10">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm font-semibold">
                            <thead className="bg-amber-900">
                                <tr className="text-white">
                                <th className="px-4 py-2 text-left font-semibold">Beer ID</th>
                                <th className="px-4 py-2 text-left font-semibold">Name</th>
                                <th className="px-4 py-2 text-left font-semibold">Style</th>
                                <th className="px-4 py-2 text-left font-semibold">ABV</th>
                                <th className="px-4 py-2 text-left font-semibold">IBU</th>
                                <th className="px-4 py-2 text-left font-semibold">Ounces</th>
                                <th className="px-4 py-2 text-left font-semibold">Price</th>
                                {/* NEW */}
                                <th className="px-4 py-2 text-left font-semibold">Flavor Tags</th>
                                {/* NEW actions */}
                                <th className="px-4 py-2 text-left font-semibold">Edit</th>
                                <th className="px-4 py-2 text-left font-semibold">Remove</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-amber-900/20">
                                {loadingBeers ? (
                                <tr>
                                    {/* was 6; now 9 columns */}
                                    <td colSpan={9} className="px-4 py-6 text-center text-amber-900">
                                    Loading…
                                    </td>
                                </tr>
                                ) : beers.length > 0 ? (
                                beers.map((b) => (
                                    <tr key={b.beerId}>
                                        <td className="px-4 py-2">{b.beerId}</td>
                                    <td className="px-4 py-2">{b.name}</td>
                                    <td className="px-4 py-2">{b.style || '—'}</td>
                                    <td className="px-4 py-2">
                                        {b.abv == null ? '—' : `${(Number(b.abv) * 100).toFixed(1)}%`}
                                    </td>
                                    <td className="px-4 py-2">{b.ibu ?? '—'}</td>
                                    <td className="px-4 py-2">{b.ounces ?? '—'}</td>
                                    <td className="px-4 py-2">
                                        {b.price == null ? '—' : `$${Number(b.price).toFixed(2)}`}
                                    </td>

                                    {/* NEW: flavor tags */}
                                    <td className="px-4 py-2">
                                        {Array.isArray(b.flavorTags) && b.flavorTags.length > 0
                                        ? b.flavorTags.join(', ')
                                        : '—'}
                                    </td>

                                    {/* NEW: edit button (non-functional) */}
                                    <td className="px-4 py-2">
                                        <button
                                        type="button"
                                        className="bg-green-200 hover:bg-green-300 text-black px-3 py-1 rounded-full font-semibold"
                                        title="Edit (coming soon)"
                                        >
                                        Edit
                                        </button>
                                    </td>

                                    {/* NEW: remove button (non-functional) */}
                                    <td className="px-4 py-2">
                                        <button
                                        type="button"
                                        className="bg-red-200 hover:bg-red-300 text-black px-3 py-1 rounded-full font-semibold"
                                        title="Remove (coming soon)"
                                        >
                                        Remove
                                        </button>
                                    </td>
                                    </tr>
                                ))
                                ) : (
                                <tr>
                                    {/* was 6; now 9 columns */}
                                    <td colSpan={9} className="px-4 py-6 text-center italic text-amber-900">
                                    Brewery doesn’t have any beers listed. Start adding!
                                    </td>
                                </tr>
                                )}
                            </tbody>
                            </table>

                    </div>
                    </section>
                )}
            </section>

        </div>

        {showBeerModal && (
            <BeerModal
                breweryId={breweryUuid}
                token={token}
                onClose={() => setShowBeerModal(false)}
                onReviewSubmit={afterBeerCreated}
            />
            )}

        {showBreweryModal && (
            <BreweryModal
            onClose={() => setShowBreweryModal(false)}
            onSaved={afterSave}
            existingBrewery={status.brewery}
            />
        )}
        </div>
    );
}
