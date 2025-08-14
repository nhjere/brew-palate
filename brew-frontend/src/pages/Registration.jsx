import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from '../components/Title';
import "../App.css";
import supabase from '../supabaseClient';
import { Link } from 'react-router-dom';

export default function Registration() {

    const BASE_URL = import.meta.env.VITE_BACKEND_URL;

    // useState manages form data
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: '',
        address: '',
    });
    
    // comment
    // in-field error handling 
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

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

        if (!formData.role) {
            setErrorMessage('Please select whether you are a User or Brewer.');
            return;
        }

        // check if username is available
        try {
            const usernameCheck = await axios.get(`${BASE_URL}/api/user/check-username`, {
                params: { username: formData.username },
            });

            if (!usernameCheck.data.available) {
                setErrorMessage('Username already taken. Please choose another.');
                return;
            }
            } catch (err) {
            console.error("Username check failed:", err);
            setErrorMessage("Failed to verify username. Please try again.");
            return;
        }

        // Register with supabase
        const { data, error } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
        });

        if (error) {
            console.error(error);
            setErrorMessage(`Registration failed: ${error.message}`);
            return;
        }

        const userId = data.user?.id;
        if (!userId) {
            setErrorMessage('No user ID returned from Supabase');
            return;
        }

        // Send extra data to backend
        try {
        const metadata = {
            userId: userId,
            username: formData.username,
            role: formData.role,
            address: formData.address,
        };

        // console.log("Sending metadata to backend...");
        await axios.post(`${BASE_URL}/api/user/register`, metadata);
        
        setSuccessMessage('Registration successful! Please check your email to verify your account.');
        } 

        catch (err) {
            console.error("Metadata POST failed:", err);

            if (err.response) {
                console.error("Backend responded:", err.response.data);
            }

            if (err.response?.status === 400 && err.response.data.includes("Username already taken")) {
                setErrorMessage('Username already taken. Please choose another.');
            } else {
                setErrorMessage('Metadata registration failed. Please try again.');
            }
            }

        console.log('set success message')
        
    }    


    return (
        <>
            <div className="min-h-screen bg-[#fff4e6] flex flex-col items-center justify-center px-4">
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
                    <div className="w-full bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
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

                        {successMessage && (
                        <div className="bg-green-100 border border-green-500 text-green-700 p-3 rounded text-center font-semibold mb-4">
                            {successMessage}
                        </div>
                        )}

                        {errorMessage && (
                        <div className="bg-red-100 border border-red-500 text-red-700 p-3 rounded text-center font-semibold mb-4">
                            {errorMessage}
                        </div>
                        )}

                        <form className="space-y-4" onSubmit={handleRegister}>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email (Login Credential)"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring focus:border-amber-500"
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

                            <Link
                            to="/login"
                            className="text-sm block text-center center pt-2 font-semibold transition"
                            >
                            Back to Login
                            </Link>
                            
                        </form>
    
                    </div>
                    </div>
                </main>
            </div>
        </>
    )  
}
