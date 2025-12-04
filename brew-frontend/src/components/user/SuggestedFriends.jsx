// src/components/user/SuggestedFriends.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import avatar from "../../assets/avatar.svg";

export default function SuggestedFriends({ withShell = true, userId }) {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const [suggestedFriends, setSuggestedFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      console.warn("SuggestedFriends: missing userId prop");
      setLoading(false);
      setError("Missing user id.");
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          setError("Not logged in.");
          setLoading(false);
          return;
        }

        const res = await axios.get(`${BASE_URL}/api/user/suggestions`, {
          params: {
            currentUserId: userId,
            limit: 8,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setSuggestedFriends(res.data);
      } catch (err) {
        console.error("Error fetching suggested friends:", err);
        setError("Failed to load suggestions.");
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [userId, BASE_URL]);

  const Content = () => {
    if (loading) {
      return (
        <div className="text-xs text-gray-500">Loading suggested friends…</div>
      );
    }

    if (error) {
      return <div className="text-xs text-red-500">{error}</div>;
    }

    if (!suggestedFriends.length) {
      return (
        <div className="text-xs text-gray-500">No suggestions yet.</div>
      );
    }

    return (
      <>
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-amber-900">
              Suggested friends for you
            </div>
            <div className="text-xs text-gray-500">
              Based on active BrewPalate users
            </div>
          </div>
          <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
            Discover
          </span>
        </div>

        {/* List */}
        <div className="space-y-1 max-h-80 overflow-y-auto pr-1 no-scrollbar">
          {suggestedFriends.map((friend) => (
            <div
              key={friend.id}
              className="flex items-center justify-between rounded-xl px-2 py-2 transition"
            >
              <div className="flex items-center space-x-3">
                <img
                  src={avatar}
                  alt={friend.displayName}
                  className="h-8 w-8 rounded-full"
                />
                <div>
                  <div className="text-sm font-medium text-amber-900">
                    {friend.displayName}
                  </div>
                  <div className="text-[11px] text-gray-500">
                    {friend.city || "Location unknown"}
                  </div>
                </div>
              </div>

              <button className="bg-blue-200 hover:bg-blue-300 text-black px-4 py-1 rounded-full font-semibold">
                Say Cheers!
              </button>
            </div>
          ))}
        </div>
      </>
    );
  };

  if (!withShell) {
    return (
      <div className="text-amber-900">
        <Content />
      </div>
    );
  }

  // Card shell: make it narrower + cleaner
  return (
    <div className="w-full bg-white rounded-2xl overflow-hidden border shadow-md transition-all p-3">
      <Content />
    </div>
  );
}
