import BrewerHeader from '../../components/brewer/BrewerHeader'
import BeerModal from '../../components/brewer/BeerModal'
import BreweryModal from '../../components/brewer/BreweryModal'
import BreweryCard from '../../components/brewer/BreweryCard.jsx';
import { useEffect, useState } from 'react';
import supabase from '../../supabaseClient.js';
import axios from 'axios';


export default function BrewerDashboard() {
  const [showBeerModal, setShowBeerModal] = useState(false);
  const [showBreweryModal, setShowBreweryModal] = useState(false);
  const [status, setStatus] = useState({ hasBrewery: false, brewery: null });
  const [refresh, setRefresh] = useState(false);

  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  // checks if user already has a brewery 
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      try {
        const { data } = await axios.get(`${BASE_URL}/api/brewer/breweries/status`, {
          headers: { 'X-User-Id': user.id },
        });
        setStatus(data);
      } catch (e) {
        console.error('Failed to fetch brewery status', e);
        setStatus({ hasBrewery: false, brewery: null });
      }
    })();
  }, [BASE_URL, refresh]);

  const afterSave = () => setRefresh(p => !p);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#fff4e6] flex flex-col
                    pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <BrewerHeader />

      <div className="flex flex-col gap-5 w-full p-5">
        <header className="text-4xl font-bold p-4 text-amber-900">Your Brewery</header>

        {/* Your Brewery section */}
        <section className="w-full bg-white/70 rounded-xl p-4 shadow">
          {status.hasBrewery && status.brewery ? (
            <>
              <BreweryCard brewery={status.brewery} />
              {/* <div className="mt-3">
                <button
                  className="bg-blue-200 hover:bg-blue-300 text-black px-4 py-1 rounded-full font-semibold"
                  onClick={() => setShowBreweryModal(true)}
                >
                  Edit Brewery
                </button>
              </div> */}
            </>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-amber-900">You haven’t created a brewery yet.</p>
              <button
                className="bg-blue-200 hover:bg-blue-300 text-black px-4 py-1 rounded-full font-semibold"
                onClick={() => setShowBreweryModal(true)}
              >
                Create My Brewery
              </button>
            </div>
          )}
        </section>

        {/* Actions */}
        <main className="flex flex-row gap-5 w-full">
          <button
            className="bg-blue-200 hover:bg-blue-300 w-1/5 text-black px-4 py-1 rounded-full font-semibold"
            onClick={() => setShowBeerModal(true)}
            disabled={!status.hasBrewery}
            title={!status.hasBrewery ? 'Create your brewery first' : ''}
          >
            Add a Beer
          </button>
        </main>

        <h2 className="text-2xl font-bold p-4 text-amber-900">Beer Catalog</h2>
        {/* render beers for this brewery.id if you want */}
      </div>

      {showBeerModal && (
        <BeerModal
          onClose={() => setShowBeerModal(false)}
          // pass breweryId to BeerModal if needed: breweryId={status.brewery?.id}
        />
      )}

      {showBreweryModal && (
        <BreweryModal
          onClose={() => setShowBreweryModal(false)}
          onSaved={afterSave}
          existingBrewery={status.brewery} // prefill if editing
        />
      )}
    </div>
  );

}