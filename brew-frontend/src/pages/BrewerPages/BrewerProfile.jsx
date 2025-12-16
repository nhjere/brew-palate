import { useEffect, useState } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import BrewerHeader from '../../components/brewer/BrewerHeader.jsx';
import BreweryCard from '../../components/brewer/BreweryCard.jsx';
import LoadingScreen from '../../components/LoadingScreen.jsx';
import { useBrewerContext } from '../../context/BrewerContext';
import supabase from '../../supabaseClient.js';
import axios from 'axios';

export default function BrewerProfile() {
  const { brewerId: urlBrewerId } = useParams();
  const navigate = useNavigate();
  const { brewerId, token, isAuthenticated, loading, isAuthorizedFor } = useBrewerContext();

  const [dataLoading, setDataLoading] = useState(true);
  const [status, setStatus] = useState({ hasBrewery: false, brewery: null });
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    created_at: '',
    role: 'brewer',
  });

  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const isAuthorized = isAuthorizedFor(urlBrewerId);

  useEffect(() => {
    if (!isAuthorized || !token) return;

    const fetchProfileData = async () => {
      setDataLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();

        const email = session?.user?.email || '';
        const createdAt = session?.user?.created_at || '';

        let username = session?.user?.user_metadata?.username || '';
        let role = 'brewer';

        try {
          const { data } = await axios.get(`${BASE_URL}/api/user/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (data?.username) username = data.username;
          if (data?.role) role = data.role;
        } catch (e) {
          console.warn('GET /api/user/me failed, using fallback username.', e);
        }

        setProfile({
          username,
          email,
          created_at: createdAt,
          role,
        });

        try {
          const { data: brewerStatus } = await axios.get(
            `${BASE_URL}/api/brewer/breweries/status`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setStatus(brewerStatus);
        } catch (e) {
          console.error('Failed to fetch brewery status', e);
          setStatus({ hasBrewery: false, brewery: null });
        }
      } catch (e) {
        console.error('Failed to initialize brewer profile:', e);
      } finally {
        setDataLoading(false);
      }
    };

    fetchProfileData();
  }, [BASE_URL, urlBrewerId, isAuthorized, token]);

  const handleLogout = async () => {
    try {
      sessionStorage.setItem('bp_user_logout', '1');
      await supabase.auth.signOut();
      localStorage.removeItem('brewer_id');
      localStorage.removeItem('user_role');
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      window.location.assign('/login');
    }
  };

  if (loading) return <LoadingScreen message="Authenticating..." />;
  if (dataLoading) return <LoadingScreen message="Loading profile..." />;
  if (!isAuthorized) return <Navigate to="/login" replace />;

  const avatarLetter =
    (profile.username?.[0] || profile.email?.[0] || 'B').toUpperCase();

  return (
    <div className="min-h-screen bg-white flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <BrewerHeader />

      <div className="w-full max-w-screen-md mx-auto px-4 py-6">
        {/* Profile card */}
        <div className="w-full bg-[#f2f2f2] overflow-hidden border border-slate-200 shadow-sm transition-all p-6">
          {/* Header row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-[#3C547A] border border-[#8C6F52]/30 flex items-center justify-center text-white font-bold">
                {avatarLetter}
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#8C6F52]">Brewer Profile</h2>
                <p className="text-xs text-slate-500">
                  Manage your brewery account details.
                </p>
              </div>
            </div>

            <button
              className="bg-white text-[#8C6F52] border border-[#8C6F52]/40 px-4 py-2 rounded-xl font-semibold hover:bg-[#dbdbdb] transition-colors text-sm"
              onClick={handleLogout}
            >
              Log out
            </button>
          </div>

          {/* Fields */}
          <div className="space-y-4 text-slate-900">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ReadOnlyField label="Username" value={profile.username || '—'} />
              <ReadOnlyField label="Email" value={profile.email || '—'} />
              <ReadOnlyField
                label="Account Type"
                value={profile.role === 'brewer' ? 'Brewer' : profile.role || '—'}
              />
              <ReadOnlyField
                label="Member Since"
                value={
                  profile.created_at
                    ? new Date(profile.created_at).toLocaleDateString()
                    : '—'
                }
              />
              {/* <ReadOnlyField
                label="Brewery Name"
                value={
                  status?.hasBrewery && status?.brewery?.breweryName
                    ? status.brewery.breweryName
                    : '—'
                }
                className="sm:col-span-2"
              /> */}
            </div>
          </div>
        </div>

        {/* Brewery details card */}
        {status.hasBrewery && status.brewery ? (
          <section className="mt-4">
            <BreweryCard brewery={status.brewery} token={token} />
          </section>
        ) : (
          <section className="w-full bg-[#f2f2f2] p-6 mt-4 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-[#8C6F52] mb-2">
                No Brewery Created
              </h3>
              <p className="text-slate-600 mb-4 text-sm">
                You haven&apos;t created a brewery yet. Head to your dashboard to get started.
              </p>
              <a
                href={`/brewer/dashboard/${urlBrewerId}`}
                className="inline-block bg-[#3C547A] hover:bg-[#314466] text-white px-6 py-2 rounded-full font-semibold text-sm transition-colors"
              >
                Go to Dashboard
              </a>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function ReadOnlyField({ label, value, className = '' }) {
  return (
    <div className={`space-y-1 ${className}`}>
      <div className="text-sm font-semibold text-slate-700">{label}</div>
      <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900">
        {value}
      </div>
    </div>
  );
}
