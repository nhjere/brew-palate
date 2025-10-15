import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid';
import avatar from '../../assets/avatar.svg'

export default function Friends({ withShell = true, userId }) {

    const BASE_URL = import.meta.env.VITE_BACKEND_URL;
    const [closeFriends, setCloseFriends] = useState([
        {
            id: 1,
            name: 'Alex Thompson',
            avatar: avatar,
            mutualFriends: 12
        },
        {
            id: 2,
            name: 'Sarah Chen',
            avatar: avatar,
            mutualFriends: 8
        },
        {
            id: 3,
            name: 'Marcus Rodriguez',
            avatar: avatar,
            mutualFriends: 15
        },
        {
            id: 4,
            name: 'Emma Williams',
            avatar: avatar,
            mutualFriends: 6
        },
        {
            id: 5,
            name: 'James Wilson',
            avatar: avatar,
            mutualFriends: 10
        }
    ]);

    // useEffect(() => {
    // if (!userId) return;

    // async function fetchReviewsAndBeers() {
    //     try {
    //     const reviewsRes = await axios.get(`${BASE_URL}/api/user/reviews/user/${userId}`);
    //     const reviews = reviewsRes.data;
    //     setReviews(reviews);

    //     const uniqueBeerIds = [...new Set(reviews.map(r => r.beerId))];
    //     if (uniqueBeerIds.length === 0) {
    //         setBeerMap({});
    //         return;
    //     }

    //     const params = new URLSearchParams();
    //     uniqueBeerIds.forEach(id => params.append('beerIds', id));

    //     const beersRes = await axios.get(`${BASE_URL}/api/import/fetchById?${params.toString()}`);
        
    //     const beerMap = {};
    //     beersRes.data.forEach(beer => {
    //         beerMap[beer.beerId] = beer;
    //     });

    //     setBeerMap(beerMap);
    //     } catch (err) {
    //     console.error('Error fetching reviews or beers', err);
    //     }
    // }

    // fetchReviewsAndBeers();
    // }, [userId, refreshRecs]);

    if (!withShell) {
        return (
            <div className="text-amber-900">
            <div className="space-y-4 text-sm font-medium !no-scrollbar pr-2">
            <div className="flex flex-col text-sm">
                Here's who you have mutuals with!
            </div>
            {closeFriends.map((friend) => (
            <div key={friend.id} className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                <img
                src={friend.avatar}
                alt={friend.name}
                className="h-8 w-8 rounded-full"
                />
                <div>
                <div className="font-medium">{friend.name}</div>
                <div className="text-xs text-gray-500">
                    {friend.mutualFriends} mutuals
                </div>
                </div>
                </div>
                <button className="px-3 py-1 text-sm font-medium text-white bg-amber-700 rounded-full hover:bg-amber-800">
                Follow
                </button>
            </div>
            ))}
            </div>
            </div>
        );
    }
}