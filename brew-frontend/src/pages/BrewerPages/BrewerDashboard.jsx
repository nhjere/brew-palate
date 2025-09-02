import BrewerHeader from '../../components/brewer/BrewerHeader';
import BeerModal from '../../components/brewer/BeerModal';
import BreweryModal from '../../components/brewer/BreweryModal';
import BreweryCard from '../../components/brewer/BreweryCard.jsx';
import BeerCatalog from '../../components/brewer/BeerCatalog.jsx';
import { useEffect, useState, useMemo } from 'react';
import supabase from '../../supabaseClient.js';
import axios from 'axios';

export default function BrewerDashboard() {
  const [showBeerModal, setShowBeerModal] = useState(false);
  const [showBreweryModal, setShowBreweryModal] = useState(false);
  const [status, setStatus] = useState({ hasBrewery: false, brewery: null });
  const [refresh, setRefresh] = useState(false);
  const [token, setToken] = useState('');
  const [brewerId, setBrewerId] = useState('');

  //refresher for beer catalog
  const [catalogBump, setCatalogBump] = useState(0);

  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

// fetches status of brewery and its metadata
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token || '';
      setToken(accessToken);
      if (!accessToken) {
        setStatus({ hasBrewery: false, brewery: null });
        return;
      }
      try {
        const { data } = await axios.get(
          `${BASE_URL}/api/brewer/breweries/status`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        setStatus(data);
        setBrewerId(session.user.id)
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

  const afterSave = () => setRefresh((p) => !p);

  const afterBeerCreated = () => {
    setShowBeerModal(false);
    setCatalogBump((n) => n + 1); // tell BeerCatalog to refetch
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

        <BeerCatalog
          token={token}
          baseUrl={BASE_URL}
          hasBrewery={Boolean(status.hasBrewery && status.brewery)}
          breweryUuid={breweryUuid}
          onAddBeer={() => setShowBeerModal(true)}
          refreshToken={catalogBump}
        />
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
