import { useEffect, useState } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import BrewerHeader from '../../components/brewer/BrewerHeader.jsx';
import BreweryCard from '../../components/brewer/BreweryCard.jsx';
import supabase from '../../supabaseClient.js';
import axios from 'axios';

export default function BrewerProfile() {
  const { brewerId: urlBrewerId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [token, setToken] = useState('');
  const [status, setStatus] = useState({ hasBrewery: false, brewery: null });
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    created_at: '',
    role: 'brewer',
  });

  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          setLoading(false);
          setIsAuthorized(false);
          return;
        }

        const accessToken = session.access_token;
        const sessionUserId = session.user.id;
        const userRole = localStorage.getItem('user_role');
        const storedBrewerId = localStorage.getItem('brewer_id');

        const isValidBrewer =
          userRole === 'brewer' &&
          urlBrewerId === sessionUserId &&
          storedBrewerId === sessionUserId;

        if (!isValidBrewer) {
          setLoading(false);
          setIsAuthorized(false);
          return;
        }

        setIsAuthorized(true);
        setToken(accessToken);

        // email + created_at from Supabase session
        const email = session.user.email || '';
        const createdAt = session.user.created_at || '';

        // username/role from backend (/api/user/me)
        let username = session.user.user_metadata?.username || '';
        let role = 'brewer';

        try {
          const { data } = await axios.get(`${BASE_URL}/api/user/me`, {
            headers: { Authorization: `Bearer ${accessToken}` },
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

        // Brewery status
        try {
          const { data: brewerStatus } = await axios.get(
            `${BASE_URL}/api/brewer/breweries/status`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          setStatus(brewerStatus);
        } catch (e) {
          console.error('Failed to fetch brewery status', e);
          setStatus({ hasBrewery: false, brewery: null });
        }
      } catch (e) {
        console.error('Failed to initialize brewer profile:', e);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [BASE_URL, urlBrewerId]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-900"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/login" replace />;
  }

  const avatarLetter =
    (profile.username?.[0] || profile.email?.[0] || 'B').toUpperCase();

  return (
    <div className="min-h-screen bg-[#fff4e6] flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <BrewerHeader />

      <div className="w-full max-w-screen-md mx-auto px-4 py-6">
        <div className="w-full bg-white rounded-2xl overflow-hidden border shadow-md transition-all p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-amber-800 border border-orange-300 flex items-center justify-center text-white font-bold">
                {avatarLetter}
              </div>
              <div>
                <h2 className="text-xl font-bold text-amber-900">Brewer Profile</h2>
                <p className="text-xs text-amber-800">Manage your brewery account details</p>
              </div>
            </div>

            <button
              className="bg-white text-amber-800 border border-amber-300 px-4 py-2 rounded-xl font-semibold hover:bg-amber-50"
              onClick={handleLogout}
            >
              Log out
            </button>
          </div>

          <div className="space-y-4 text-amber-900">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ReadOnlyField label="Username" value={profile.username || '—'} />
              <ReadOnlyField label="Email" value={profile.email || '—'} />
              <ReadOnlyField
                label="Account Type"
                value={<span className="">
                  {profile.role === 'brewer' ? 'Brewer' : profile.role || '—'}
                </span>}
              />
              <ReadOnlyField
                label="Member Since"
                value={profile.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'}
              />
              <ReadOnlyField
                label="Brewery Name"
                value={(status?.hasBrewery && status?.brewery?.name) ? status.brewery.name : '—'}
                className="sm:col-span-2"
              />
            </div>
          </div>
        </div>

        {status.hasBrewery && status.brewery ? (
          <section className="w-full bg-white p-4 mt-4 rounded-2xl overflow-hidden border shadow-md transition-all">
            <BreweryCard brewery={status.brewery} token={token} />
          </section>
        ) : (
          <section className="w-full bg-white p-6 mt-4 rounded-2xl overflow-hidden border shadow-md">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-amber-900 mb-2">No Brewery Created</h3>
              <p className="text-gray-600 mb-4">
                You haven’t created a brewery yet. Head to your dashboard to get started!
              </p>
              <a
                href={`/brewer/dashboard/${urlBrewerId}`}
                className="inline-block bg-blue-200 hover:bg-blue-300 text-black px-6 py-2 rounded-full font-semibold"
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
      <div className="text-xs font-semibold text-gray-500">{label}</div>
      <div className="text-sm text-amber-800">
        {value}
      </div>
    </div>
  );
}
