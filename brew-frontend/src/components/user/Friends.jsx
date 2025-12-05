import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid';
import avatar from '../../assets/avatar.svg'

export default function Friends({ withShell = true, userId }) {

    const BASE_URL = import.meta.env.VITE_BACKEND_URL;

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