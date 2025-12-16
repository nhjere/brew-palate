import { useEffect, useState } from 'react';
import axios from 'axios';

export default function BeerCatalog({ token, baseUrl, hasBrewery, breweryUuid, onAddBeer, refreshToken = 0 }) {
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
      const { [beerId]: _ignored, ...rest } = m;
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
        ? e.flavorTagsStr.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
    };

    try {
      const res = await axios.patch(
        `${baseUrl}/api/brewer/breweries/update/beer/${beerId}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const server = res?.data ?? {};
      setBeers((prev) =>
        prev.map((b) =>
          b.beerId === beerId
            ? {
                ...b,
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
    <section className="relative w-full overflow-hidden bg-[#f2f2f2]  p-6">
      <main className="flex flex-row gap-5 w-full items-center pb-4">
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#8C6F52] leading-tight">
          Beer Catalog
        </h2>

        <button
          className="ml-auto bg-[#3C547A] hover:bg-[#314466] text-white px-4 py-2 rounded-full
                     text-sm font-semibold disabled:opacity-60 transition-colors"
          onClick={onAddBeer}
          disabled={!hasBrewery}
          title={!hasBrewery ? 'Create your brewery first' : ''}
        >
          Add a Beer
        </button>
      </main>

      {hasBrewery && (
        <section className="lg:col-span-2 w-full p-4 overflow-hidden border border-[#E0D4C2] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm font-medium text-slate-700">
              <thead className="bg-[#3C547A] text-white text-[11px] uppercase tracking-wide">
                <tr>
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

              <tbody className="divide-y divide-[#E0D4C2]">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-6 text-center text-[#8C6F52]">
                      Loading…
                    </td>
                  </tr>
                ) : beers.length > 0 ? (
                  beers.map((b, idx) => {
                    const e = editing[b.beerId];
                    const rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-[#FBF6EF]';
                    return (
                      <tr key={b.beerId} className={rowBg}>
                        <td className="px-4 py-2 align-top">{b.beerId}</td>

                        {/* Name */}
                        <td className="px-4 py-2 align-top">
                          {e ? (
                            <input
                              className="border border-gray-300 rounded-md px-2 py-1 w-full
                                         text-sm focus:outline-none focus:ring-1 focus:ring-[#8C6F52]"
                              value={e.name}
                              onChange={(ev) => changeField(b.beerId, 'name', ev.target.value)}
                            />
                          ) : (
                            b.name
                          )}
                        </td>

                        {/* Style */}
                        <td className="px-4 py-2 align-top">
                          {e ? (
                            <input
                              className="border border-gray-300 rounded-md px-2 py-1 w-full
                                         text-sm focus:outline-none focus:ring-1 focus:ring-[#8C6F52]"
                              value={e.style}
                              onChange={(ev) => changeField(b.beerId, 'style', ev.target.value)}
                            />
                          ) : (
                            b.style || '—'
                          )}
                        </td>

                        {/* ABV (%) */}
                        <td className="px-4 py-2 align-top">
                          {e ? (
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="100"
                              className="border border-gray-300 rounded-md px-2 py-1 w-24
                                         text-sm focus:outline-none focus:ring-1 focus:ring-[#8C6F52]"
                              value={e.abvPct}
                              onChange={(ev) => changeField(b.beerId, 'abvPct', ev.target.value)}
                            />
                          ) : b.abv == null ? (
                            '—'
                          ) : (
                            (Number(b.abv) * 100).toFixed(1)
                          )}
                        </td>

                        {/* IBU */}
                        <td className="px-4 py-2 align-top">
                          {e ? (
                            <input
                              type="number"
                              step="1"
                              min="0"
                              className="border border-gray-300 rounded-md px-2 py-1 w-20
                                         text-sm focus:outline-none focus:ring-1 focus:ring-[#8C6F52]"
                              value={e.ibu}
                              onChange={(ev) => changeField(b.beerId, 'ibu', ev.target.value)}
                            />
                          ) : (
                            b.ibu ?? '—'
                          )}
                        </td>

                        {/* Ounces */}
                        <td className="px-4 py-2 align-top">
                          {e ? (
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              className="border border-gray-300 rounded-md px-2 py-1 w-24
                                         text-sm focus:outline-none focus:ring-1 focus:ring-[#8C6F52]"
                              value={e.ounces}
                              onChange={(ev) => changeField(b.beerId, 'ounces', ev.target.value)}
                            />
                          ) : (
                            b.ounces ?? '—'
                          )}
                        </td>

                        {/* Price */}
                        <td className="px-4 py-2 align-top">
                          {e ? (
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              className="border border-gray-300 rounded-md px-2 py-1 w-24
                                         text-sm focus:outline-none focus:ring-1 focus:ring-[#8C6F52]"
                              value={e.price}
                              onChange={(ev) => changeField(b.beerId, 'price', ev.target.value)}
                            />
                          ) : b.price == null ? (
                            '—'
                          ) : (
                            `$${Number(b.price).toFixed(2)}`
                          )}
                        </td>

                        {/* Flavor Tags */}
                        <td className="px-4 py-2 align-top">
                          {e ? (
                            <input
                              className="border border-gray-300 rounded-md px-2 py-1 w-full
                                         text-sm focus:outline-none focus:ring-1 focus:ring-[#8C6F52]"
                              placeholder="citrus, hoppy, smooth"
                              value={e.flavorTagsStr}
                              onChange={(ev) =>
                                changeField(b.beerId, 'flavorTagsStr', ev.target.value)
                              }
                            />
                          ) : Array.isArray(b.flavorTags) && b.flavorTags.length > 0 ? (
                            b.flavorTags.join(', ')
                          ) : (
                            '—'
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-2 align-top">
                          {e ? (
                            <div className="flex items-center gap-2 whitespace-nowrap">
                              <button
                                className="inline-flex bg-[#D1F4E2] hover:bg-[#BFEFD4]
                                           px-3 py-1 rounded-full text-xs font-semibold text-[#166534]"
                                onClick={() => saveEdit(b.beerId)}
                              >
                                Save
                              </button>
                              <button
                                className="inline-flex border border-gray-300 hover:bg-gray-50
                                           px-3 py-1 rounded-full text-xs font-semibold text-slate-600"
                                onClick={() => cancelEdit(b.beerId)}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 whitespace-nowrap">
                              <button
                                className="inline-flex bg-[#E0ECFF] hover:bg-[#D1E0FF]
                                           px-3 py-1 rounded-full text-xs font-semibold text-[#314466]"
                                onClick={() => startEdit(b)}
                              >
                                Edit
                              </button>
                              <button
                                className="inline-flex bg-[#FDE2E1] hover:bg-[#FCD0CF]
                                           px-3 py-1 rounded-full text-xs font-semibold text-[#9B1C1C]"
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
                    <td
                      colSpan={9}
                      className="px-4 py-6 text-center italic text-sm text-[#8C6F52]"
                    >
                      Brewery doesn’t have any beers listed yet. Start adding!
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
