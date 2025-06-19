import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/header';
import SearchBar from '../components/SearchBar';
import "../App.css";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export default function Registration() {

    // in-field error handling 
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // useState manages form data
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: '',
        address: '',
    });
    
    // updates formData and matches input (name) to user input (value)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
        ...prev,
        [name]: value,
        }));
    };

    // handles form submission 
    const handleRegister = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        if (formData.password !== formData.confirmPassword) {
            setErrorMessage('Passwords do not match');
            return;
        }

        // calls supabase auth service with user email and password
        const { data, error } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
        });

        if (error) {
            console.error(error);
            setErrorMessage(`Registration failed: ${error.message}`);
            return;
        }

        console.log("Supabase user created:", data.user);
        setSuccessMessage('Registration successful! Please check your email to verify your account.');
    };

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
                            <p className=" text-sm text-gray-700">Be sure to select if you are a brewer or user!</p>
                    </div>
                    <div className="flex space-x-4 items-center">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-amber-800">
                        <input
                        type="radio"
                        name="role"
                        value="user"
                        checked={formData.role === "user"}
                        onChange={handleChange}
                        className="h-4 w-4 accent-amber-800 bg-white border-gray-300"
                        />
                        <span>User</span>
                    </label>

                    <label className="flex items-center space-x-2 text-sm font-semibold text-amber-800">
                        <input
                        type="radio"
                        name="role"
                        value="brewer"
                        checked={formData.role === "brewer"}
                        onChange={handleChange}
                        className="h-4 w-4 accent-amber-800 bg-white border-gray-300"
                        />
                        <span>Brewer</span>
                    </label>
                    </div>

                        </div>
    
                        {/* Registration form */}
                        <form className="space-y-4" onSubmit={handleRegister}>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring focus:border-amber-500 text-blue-800"
                            />
                            <input
                                type="text"
                                name="username"
                                placeholder="Username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring focus:border-amber-500"
                            />
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring focus:border-amber-500"
                            />
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirm Password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring focus:border-amber-500"
                            />
                            <input
                                type="text"
                                name="address"
                                placeholder="Address (Optional)"
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring focus:border-amber-500"
                            />

                            <button
                                type="submit"
                                className="w-full bg-blue-200 text-black font-bold py-2 px-4 rounded-md hover:bg-blue-300 transition"
                            >
                                Register!
                            </button>
                            
                            {errorMessage && (
                                <p className="text-red-600 text-xs font-medium">{errorMessage}</p>
                            )}

                            {successMessage && (
                                <p className="text-green-600 text-xs font-medium">{successMessage}</p>
                            )}
                                    
    
                        </form>
    
                    </div>
                    </div>
                </main>
            </div>
        </>
    )  
}
