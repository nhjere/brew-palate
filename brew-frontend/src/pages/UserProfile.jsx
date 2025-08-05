import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

function UserProfile() {

    const [userProfile, setUserProfile] = useState([]);
    const BASE_URL = import.meta.env.VITE_BACKEND_URL;
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        address: '',
        email: '',
    });

    useEffect (() => {
        const fetchUserProfile = async() => {
        const { data: {session}} = await supabase.auth.getSession();
        if (!session) return;

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


    return (
        <div className="min-h-screen bg-amber-50 flex flex-col">
        <div className="flex items-center justify-between bg-orange-100 p-4 shadow-md">
            <Header />
        </div>

        <div className="flex flex-col items-center justify-start p-6 w-full max-w-screen-md mx-auto">
            {userProfile ? (
            <div className="bg-white w-full rounded-lg shadow-md p-6 border border-gray-300">
                <h2 className="text-xl font-bold text-amber-800 mb-4">User Information</h2>

                {isEditing ? (
                    <div className="space-y-4">
                        <div>
                        <label className="block text-sm font-medium text-gray-700">Username</label>
                        <input
                            type="text"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            className="w-full border border-gray-300 rounded px-3 py-1"
                        />
                        </div>
                        <div>
                        <label className="block text-sm font-medium text-gray-700">Address</label>
                        <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="w-full border border-gray-300 rounded px-3 py-1"
                        />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full border border-gray-300 rounded px-3 py-1"
                            />
                        </div>
                        <div className="flex gap-4">
                        <button
                            className="bg-green-600 text-white px-4 py-1 rounded"
                            onClick={updateUserProfile}
                        >
                            Save
                        </button>
                        <button
                            className="bg-gray-400 text-white px-4 py-1 rounded"
                            onClick={() => setIsEditing(false)}
                        >
                            Cancel
                        </button>
                        </div>
                    </div>
                ) : (
                <div className="space-y-2 text-gray-800">
                    <p><span className="font-medium">Username:</span> {userProfile.username}</p>
                    <p><span className="font-medium">Address:</span> {userProfile.address}</p>
                    <p><span className="font-medium">Email:</span> {userProfile.email}</p>
                    <button
                    className="text-blue-600 hover:underline mt-2"
                    onClick={() => setIsEditing(true)}
                    >
                    Edit Profile
                    </button>
                </div>
                )}
            </div>
            ) : (
            <div className="text-amber-800 text-lg">Loading profile...</div>
            )}
        </div>
        </div>
  );


}

export default UserProfile;