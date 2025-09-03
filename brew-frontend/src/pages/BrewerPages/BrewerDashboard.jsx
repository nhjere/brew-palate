import BrewerHeader from '../../components/brewer/BrewerHeader';
import BeerModal from '../../components/brewer/BeerModal';
import BreweryModal from '../../components/brewer/BreweryModal';
import BreweryCard from '../../components/brewer/BreweryCard.jsx';
import BeerCatalog from '../../components/brewer/BeerCatalog.jsx';
import LoadingScreen from '../../components/LoadingScreen.jsx';
import { useEffect, useState, useMemo } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useBrewerContext } from '../../context/BrewerContext';
import axios from 'axios';

export default function BrewerDashboard() {
  const { brewerId: urlBrewerId } = useParams();
  const { brewerId, token, isAuthenticated, loading, isAuthorizedFor } = useBrewerContext();
  
  const [showBeerModal, setShowBeerModal] = useState(false);
  const [showBreweryModal, setShowBreweryModal] = useState(false);
  const [status, setStatus] = useState({ hasBrewery: false, brewery: null });
  const [refresh, setRefresh] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  //refresher for beer catalog
  const [catalogBump, setCatalogBump] = useState(0);

  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  // Check authorization
  const isAuthorized = isAuthorizedFor(urlBrewerId);

  // fetches status of brewery and its metadata
  useEffect(() => {
    if (!isAuthorized || !token) return;

    const fetchBreweryStatus = async () => {
      setDataLoading(true);
      try {
        const { data } = await axios.get(
          `${BASE_URL}/api/brewer/breweries/status`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setStatus(data);
      } catch (e) {
        console.error('Failed to fetch brewery status', e);
        setStatus({ hasBrewery: false, brewery: null });
      } finally {
        setDataLoading(false);
      }
    };

    fetchBreweryStatus();
  }, [BASE_URL, token, isAuthorized, refresh]);

  const breweryUuid = useMemo(
    () => status?.brewery?.breweryId || status?.brewery?.id || null,
    [status]
  );

  const afterSave = () => setRefresh((p) => !p);

  const afterBeerCreated = () => {
    setShowBeerModal(false);
    setCatalogBump((n) => n + 1); // tell BeerCatalog to refetch
  };

  // Show loading while checking authentication
  if (loading) {
    return <LoadingScreen message="Authenticating..." />;
  }

  // Show loading while fetching data
  if (dataLoading) {
    return <LoadingScreen message="Loading dashboard..." />;
  }

  // Redirect if not authorized
  if (!isAuthorized) {
    return <Navigate to="/login" replace />;
  }

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