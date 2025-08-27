import { useEffect, useState } from 'react';
import axios from 'axios';
import NewHeader from '../components/user/UserHeader';
import supabase from '../supabaseClient';
import { useNavigate, useParams } from 'react-router-dom';

function UserProfile() {

    const [userProfile, setUserProfile] = useState([]);
    const BASE_URL = import.meta.env.VITE_BACKEND_URL;
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        address: '',
        email: '',
    });

    useEffect (() => {
        const fetchUserProfile = async() => {
        const { data: {session}} = await supabase.auth.getSession();
        if (!session) {
          // Session expired — mark flag and reload so modal appears
          sessionStorage.setItem("bp_showLogoutModal", "1");
          window.location.reload();
          return;
        }

          const token = session.access_token;
          const userId = session.user.id;
          const email = session.user.email;

          try {
              const res = await axios.get(`${BASE_URL}/api/user/profile`, {
                  headers: {
                      Authorization: `Bearer ${token}`,
                  },
              });
              

              const profile = {...res.data, email}

              setFormData({
                  username: profile.username || '',
                  address: profile.address || '',
                  email: email || '',
              });

              setUserProfile(profile)

          } catch (err) {
              console.error('Failed to fetch user profile:', err);
          }

        };

        fetchUserProfile();
    }, []);


    const updateUserProfile = async() => {

        const { data: {session}} = await supabase.auth.getSession();
        if (!session) return;
        const token = session.access_token;
        try {
            
            const newUsername = formData.username.trim();
            const currentUsername = userProfile.username;

            if (newUsername !== currentUsername) {
            const res = await axios.get(`${BASE_URL}/api/user/check-username`, {
                params: { username: newUsername },
            });

            if (!res.data.available) {
                alert("That username is already taken. Please choose another.");
                return;
            }
        }


            await axios.patch(`${BASE_URL}/api/user/profile/update`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // email change logic
            const cleanedEmail = formData.email.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(cleanedEmail)) {
                alert('Please enter a valid email address.');
            return;
            }

            if (cleanedEmail !== userProfile.email) {
            const { error } = await supabase.auth.updateUser({ email: cleanedEmail });

            if (error) {
                if (error.message.includes("already been registered")) {
                alert("This email is already in use. Please choose a different one.");
                return; 
                } else {
                console.error("Email update failed:", error.message);
                alert("Something went wrong updating your email.");
                return;
                }
            } else {
                alert('A confirmation link has been sent to your new email.');
            }
            }

            // updates profile
            setUserProfile({...userProfile, ...formData});
            setIsEditing(false)
        } catch(err) {
            console.error('Failed to update profile, ', err);
        }
    };

    const handleCancel = () => {
        setFormData({
        username: userProfile?.username || '',
        address: userProfile?.address || '',
        email: userProfile?.email || '',
        });
        setIsEditing(false);
    };



    return (
  <div className="min-h-screen bg-[#fff4e6] flex flex-col">
    <NewHeader />

    <div className="w-full max-w-screen-md mx-auto px-4 py-6">
      {userProfile ? (
        <div className="w-full bg-white rounded-2xl overflow-hidden border shadow-md transition-all p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-amber-800 border border-orange-300 flex items-center justify-center text-white font-bold">
                {userProfile.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-xl font-bold text-amber-900">Your Profile</h2>
                <p className="text-xs text-amber-800">Manage your account details</p>
              </div>
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-amber-800 mb-1">Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
                    placeholder="your_handle"
                  />

                    <p className="text-xs text-amber-700 mt-1">
                    How your friends can find you
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-amber-800 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
                    placeholder="you@example.com"
                  />
                    <p className="text-xs text-amber-700 mt-1">
                    Used as your log in credential
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-amber-800 mb-1">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300"
                    placeholder="123 Main St, City, ST ZIP"
                  />
                  <p className="text-xs text-amber-700 mt-1">
                    Used to find nearby breweries and personalize your map.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  className="bg-blue-200 hover:bg-blue-300 text-black px-4 py-1 rounded-full font-semibold"
                  onClick={updateUserProfile}
                >
                  Save
                </button>
                <button
                  className="bg-white text-amber-800 border border-amber-300 px-5 py-2 rounded-xl font-semibold hover:bg-amber-50"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-amber-900">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-amber-800">Username</div>
                  <div className="bg-white border-gray-300 border rounded-xl px-3 py-2">
                    {userProfile.username || '—'}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm font-semibold text-amber-800">Email</div>
                  <div className="bg-white border-gray-300 border rounded-xl px-3 py-2 break-all">
                    {userProfile.email || '—'}
                  </div>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <div className="text-sm font-semibold text-amber-800">Address</div>
                  <div className="bg-white border-gray-300 border rounded-xl px-3 py-2">
                    {userProfile.address || '—'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  className="bg-blue-200 hover:bg-blue-300 text-black px-4 py-1 rounded-full font-semibold"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
                <button
                  className="bg-white text-amber-800 border border-amber-300 px-4 py-2 rounded-xl font-semibold hover:bg-amber-50"
                  onClick={async () => {
                      await supabase.auth.signOut();
                     localStorage.removeItem("user_id");
                     navigate("/login");
                }}
                >
                  Log out
                </button>


              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-amber-800 text-lg text-center">Loading profile...</div>
      )}
    </div>
  </div>
);


}

export default UserProfile;