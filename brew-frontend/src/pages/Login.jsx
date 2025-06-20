import Header from '../components/header';
import "../App.css";
import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)


export default function Login() {
    const navigate = useNavigate();

    // creates state object called form data (only email and password for login)
    const [formData, setFormData] = useState({
        email: '',
        password:'',
    });

    // in-field error handling 
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    
    //  updates form data
    const handleChange = (e) => {
        const {name, value } = e.target;
        setFormData((prev => ({
            ...prev,
            [name] : value,
        })));
    };

    // triggered when user hits login button
    const handleLogIn = async (e) => {
        // prevents page refresh
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        const {data, error} = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password
        })

        if (error) {
            console.error(error);
            setErrorMessage('Login failed: ' + error.message);
            return;
        }

        console.log('User ', data.user, 'logged in')
        setSuccessMessage('Login successful!')
        navigate('/user/dashboard'); 

    }


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
                        <h2 className="text-xl text-center text-amber-800 font-bold">Log in!</h2>
                    </div>
                    </div>

                    {/* Login form */}
                    <form className="space-y-4" onSubmit={handleLogIn}>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
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
                        <button
                            type="submit"
                            className="w-full bg-blue-200 text-black font-bold py-2 px-4 rounded-md hover:bg-blue-300 transition"
                        >
                            Log In
                        </button>

                        {errorMessage && (
                            <p className="text-red-600 text-sm font-medium">{errorMessage}</p>
                        )}
                        {successMessage && (
                            <p className="text-green-600 text-sm font-medium">{successMessage}</p>
                        )}

                        <div className="text-sm pt-2">
                            Don’t have an account?
                            <button
                                type="button"
                                className="ml-1 text-amber-700 font-semibold register-link"
                                onClick={() => navigate("/register")}>
                                Register
                            </button>
                                                        <button
                                type="button"
                                className="ml-1 text-amber-700 font-semibold register-link"
                                onClick={() => navigate("/user/dashboard")}>
                                Guest
                            </button>
                        </div>
                    </form>

                </div>
                </div>
            </main>
        </div>
        </>
    )
}