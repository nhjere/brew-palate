import { useEffect, useState } from 'react';
import axios from 'axios';

export default function BeerCatalog({token, baseUrl, hasBrewery, breweryUuid, onAddBeer, refreshToken = 0}) {
    const [beers, setBeers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState({}); 

    // fetch
    useEffect(() => {
        const run = async () => {
        if (!token || !hasBrewery || !breweryUuid) {
            setBeers([]);
            return;
        }
        try {
            setLoading(true);
            const { data } = await axios.get(`${baseUrl}/api/import/by-brewery/${breweryUuid}`);
            setBeers(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error('Failed to fetch beers', e);
            setBeers([]);
        } finally {
            setLoading(false);
        }
        };
        run();
    }, [token, hasBrewery, breweryUuid, baseUrl, refreshToken]);

    // enter edit for a row
    const startEdit = (b) => {
        setEditing((m) => ({
        ...m,
        [b.beerId]: {
            name: b.name ?? '',
            style: b.style ?? '',
            abvPct: b.abv == null ? '' : (Number(b.abv) * 100).toFixed(1),
            ibu: b.ibu ?? '',
            ounces: b.ounces ?? '',
            price: b.price ?? '',
            flavorTagsStr: Array.isArray(b.flavorTags) ? b.flavorTags.join(', ') : '',
        },
        }));
    };

    const cancelEdit = (beerId) => {
        setEditing((m) => {
        const { [beerId]: _, ...rest } = m;
        return rest;
        });
    };

    const changeField = (beerId, field, value) => {
        setEditing((m) => ({ ...m, [beerId]: { ...m[beerId], [field]: value } }));
    };

    const saveEdit = async (beerId) => {
        if (!token) return;
        const e = editing[beerId];
        if (!e) return;

        const payload = {
            name: e.name,
            style: e.style,
            abv: e.abvPct === '' ? null : Number(e.abvPct) / 100,
            ibu: e.ibu === '' ? null : Number(e.ibu),
            ounces: e.ounces === '' ? null : Number(e.ounces),
            price: e.price === '' ? null : Number(e.price),
            flavorTags: e.flavorTagsStr
            ? e.flavorTagsStr.split(',').map(s => s.trim()).filter(Boolean)
            : [],
        };

        try {
            const res = await axios.patch(
            `${baseUrl}/api/brewer/breweries/update/beer/${beerId}`,
            payload,
            { headers: { Authorization: `Bearer ${token}` } }
            );

            // Prefer server’s object if returned; otherwise fall back to payload
            const server = res?.data ?? {};
            setBeers(prev =>
            prev.map(b =>
                b.beerId === beerId
                ? {
                    ...b,
                    // server wins; fallback to payload if server didn’t send a field
                    name: server.name ?? payload.name ?? b.name,
                    style: server.style ?? payload.style ?? b.style,
                    abv: server.abv ?? payload.abv ?? b.abv,
                    ibu: server.ibu ?? payload.ibu ?? b.ibu,
                    ounces: server.ounces ?? payload.ounces ?? b.ounces,
                    price: server.price ?? payload.price ?? b.price,
                    flavorTags: server.flavorTags ?? payload.flavorTags ?? b.flavorTags,
                    }
                : b
            )
            );

            cancelEdit(beerId);
        } catch (err) {
            console.error('Failed to update beer', err);
            alert('Could not update beer. Check values and try again.');
        }
        };


    const removeBeer = async (beerId) => {
        if (!token) return;
        if (!window.confirm('Are you sure you want to remove this beer?')) return;
        try {
        await axios.delete(`${baseUrl}/api/brewer/breweries/remove/beer/${beerId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        setBeers((arr) => arr.filter((b) => b.beerId !== beerId));
        } catch (err) {
        console.error('Failed to remove beer', err);
        alert('Could not remove beer. Try again.');
        }
    };

    return (
        <section className="w-full bg-white rounded-2xl p-4 overflow-hidden border shadow-md transition-all">
        <main className="flex flex-row gap-5 w-full items-center">
            <h2 className="text-2xl font-bold p-4 text-amber-900">Beer Catalog</h2>

            <button
            className="ml-auto bg-blue-200 hover:bg-blue-300 text-black px-4 py-1 rounded-full font-semibold disabled:opacity-60"
            onClick={onAddBeer}
            disabled={!hasBrewery}
            title={!hasBrewery ? 'Create your brewery first' : ''}
            >
            Add a Beer
            </button>
        </main>

        {hasBrewery && (
            <section className="lg:col-span-2 w-full p-4 overflow-hidden shadow-sm rounded-xl border border-amber-900/10">
            <div className="overflow-x-auto">
                <table className="w-full text-sm font-semibold">
                <thead className="bg-amber-900">
                    <tr className="text-white">
                    <th className="px-4 py-2 text-left font-semibold">Beer ID</th>
                    <th className="px-4 py-2 text-left font-semibold">Name</th>
                    <th className="px-4 py-2 text-left font-semibold">Style</th>
                    <th className="px-4 py-2 text-left font-semibold">ABV (%)</th>
                    <th className="px-4 py-2 text-left font-semibold">IBU</th>
                    <th className="px-4 py-2 text-left font-semibold">Ounces</th>
                    <th className="px-4 py-2 text-left font-semibold">Price ($)</th>
                    <th className="px-4 py-2 text-left font-semibold">Flavor Tags</th>
                    <th className="px-4 py-2 text-left font-semibold">Actions</th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-amber-900/20">
                    {loading ? (
                    <tr>
                        <td colSpan={9} className="px-4 py-6 text-center text-amber-900">Loading…</td>
                    </tr>
                    ) : beers.length > 0 ? (
                    beers.map((b) => {
                        const e = editing[b.beerId];
                        return (
                        <tr key={b.beerId}>
                            <td className="px-4 py-2">{b.beerId}</td>

                            {/* Name */}
                            <td className="px-4 py-2">
                            {e ? (
                                <input
                                className="border rounded px-2 py-1 w-full"
                                value={e.name}
                                onChange={(ev) => changeField(b.beerId, 'name', ev.target.value)}
                                />
                            ) : b.name}
                            </td>

                            {/* Style */}
                            <td className="px-4 py-2">
                            {e ? (
                                <input
                                className="border rounded px-2 py-1 w-full"
                                value={e.style}
                                onChange={(ev) => changeField(b.beerId, 'style', ev.target.value)}
                                />
                            ) : (b.style || '—')}
                            </td>

                            {/* ABV (%) */}
                            <td className="px-4 py-2">
                            {e ? (
                                <input
                                type="number" step="0.1" min="0" max="100"
                                className="border rounded px-2 py-1 w-24"
                                value={e.abvPct}
                                onChange={(ev) => changeField(b.beerId, 'abvPct', ev.target.value)}
                                />
                            ) : (b.abv == null ? '—' : (Number(b.abv) * 100).toFixed(1))}
                            </td>

                            {/* IBU */}
                            <td className="px-4 py-2">
                            {e ? (
                                <input
                                type="number" step="1" min="0"
                                className="border rounded px-2 py-1 w-20"
                                value={e.ibu}
                                onChange={(ev) => changeField(b.beerId, 'ibu', ev.target.value)}
                                />
                            ) : (b.ibu ?? '—')}
                            </td>

                            {/* Ounces */}
                            <td className="px-4 py-2">
                            {e ? (
                                <input
                                type="number" step="0.1" min="0"
                                className="border rounded px-2 py-1 w-24"
                                value={e.ounces}
                                onChange={(ev) => changeField(b.beerId, 'ounces', ev.target.value)}
                                />
                            ) : (b.ounces ?? '—')}
                            </td>

                            {/* Price */}
                            <td className="px-4 py-2">
                            {e ? (
                                <input
                                type="number" step="0.01" min="0"
                                className="border rounded px-2 py-1 w-24"
                                value={e.price}
                                onChange={(ev) => changeField(b.beerId, 'price', ev.target.value)}
                                />
                            ) : (b.price == null ? '—' : `$${Number(b.price).toFixed(2)}`)}
                            </td>

                            {/* Flavor Tags */}
                            <td className="px-4 py-2">
                            {e ? (
                                <input
                                className="border rounded px-2 py-1 w-full"
                                placeholder="citrus, hoppy, smooth"
                                value={e.flavorTagsStr}
                                onChange={(ev) => changeField(b.beerId, 'flavorTagsStr', ev.target.value)}
                                />
                            ) : (
                                Array.isArray(b.flavorTags) && b.flavorTags.length > 0
                                ? b.flavorTags.join(', ')
                                : '—'
                            )}
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-2">
                                {e ? (
                                    <div className="flex items-center gap-2 whitespace-nowrap">
                                    <button
                                        className="inline-flex bg-green-200 hover:bg-green-300 px-3 py-1 rounded-full font-semibold"
                                        onClick={() => saveEdit(b.beerId)}
                                        
                                    >
                                        Save
                                    </button>
                                    <button
                                        className="inline-flex bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-full font-semibold"
                                        onClick={() => cancelEdit(b.beerId)}
                                    >
                                        Cancel
                                    </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 whitespace-nowrap">
                                    <button
                                        className="inline-flex bg-blue-200 hover:bg-blue-300 px-3 py-1 rounded-full font-semibold"
                                        onClick={() => startEdit(b)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="inline-flex bg-red-200 hover:bg-red-300 px-3 py-1 rounded-full font-semibold"
                                        onClick={() => removeBeer(b.beerId)}
                                    >
                                        Remove
                                    </button>
                                    </div>
                                )}
                                </td>

                        </tr>
                        );
                    })
                    ) : (
                    <tr>
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
    );
}
