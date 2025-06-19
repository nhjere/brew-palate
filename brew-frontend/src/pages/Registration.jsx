import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/header';
import SearchBar from '../components/SearchBar';
import "../App.css";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://your-project.supabase.co',
  'your-public-anon-key'
);


export default function Registration() {

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        address: '',
    });

    return (
        <>
            <div className="min-h-screen bg-orange-100 flex flex-col items-center justify-center px-4">
                {/* Site Title */}
                <div className="text-center mb-10">
                    < Header />
                    <p className="text-md text-amber-800">
                    Discover and review the best craft beers near you!
                    </p>
                </div>
    
                {/* Main content */}
                <main className="w-full max-w-3xl p-2">
                    <div className="flex flex-col w-full">
                    <div className="w-full bg-red-50 border border-gray-300 rounded-lg p-6 shadow-sm">
                        
                        {/* Header row and toggle */}
                        <div className="flex justify-between items-start mb-4">
                        <div className="text-left">
                            <h2 className="text-xl text-amber-800 font-bold">Register with BrewPalate!</h2>
                            <p className="italic text-sm text-gray-700">
                            Be sure to select if you are a brewer or user
                            </p>
                        </div>
                    <div className="flex space-x-4 items-center">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-amber-800">
                        <input
                        type="radio"
                        name="role"
                        value="user"
                        className="accent-amber-800 bg-white"
                        />
                        <span>User</span>
                    </label>

                    <label className="flex items-center space-x-2 text-sm font-semibold text-amber-800">
                        <input
                        type="radio"
                        name="role"
                        value="brewer"
                        className="accent-amber-800 bg-white"
                        />
                        <span>Brewer</span>
                    </label>
                    </div>

                        </div>
    
                        {/* Login form */}
                        <form className="space-y-4">
                        <input
                            type="email"
                            placeholder="Email"
                            className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring focus:border-amber-500"
                        />
                        <input
                            type="username"
                            placeholder="Username"
                            className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring focus:border-amber-500"
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring focus:border-amber-500"
                        />
                         <input
                            type="password"
                            placeholder="Confirm Password"
                            className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring focus:border-amber-500"
                        />
                         <input
                            type="address"
                            placeholder="Address (Optional)"
                            className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring focus:border-amber-500"
                        />
                        <button
                            type="submit"
                            className="w-full bg-blue-200 text-black font-bold py-2 px-4 rounded-md hover:bg-blue-300 transition"
                        >
                            Register!
                        </button>
                        
                                
    
                        </form>
    
                    </div>
                    </div>
                </main>
            </div>
        </>
    )  
}
