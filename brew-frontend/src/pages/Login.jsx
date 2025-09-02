import Header from '../components/Title';
import "../App.css";
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import supabase from '../supabaseClient';

export default function Login() {
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogIn = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      console.error(error);
      setErrorMessage('Login failed: ' + error.message);
      return;
    }

    const session = data?.session;
    if (!session) {
      setErrorMessage('No session returned');
      return;
    }

    try {
      const token = session.access_token;
      const userId = session.user.id;

      const res = await axios.get(`${BASE_URL}/api/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { role } = res.data;

      if (role === 'brewer') {
        // Store as brewer_id for brewer-specific pages
        localStorage.setItem('brewer_id', userId);
        localStorage.setItem('user_role', 'brewer');
        navigate(`/brewer/dashboard/${userId}`, { replace: true });
      } else {
        // Store as user_id for regular user pages  
        localStorage.setItem('user_id', userId);
        localStorage.setItem('user_role', 'user');
        navigate(`/user/dashboard/${userId}`, { replace: true });
      }
    } catch (e) {
      console.error(e);
      setErrorMessage('Unable to fetch user role. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#fff4e6] flex flex-col items-center justify-center px-4">
      <div className="text-center mb-10">
        <Header />
        <p className="text-md text-amber-800">
          Discover and review the best craft beers near you!
        </p>
      </div>

      <main className="w-full max-w-3xl p-2">
        <div className="flex flex-col w-full">
          <div className="w-full bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="text-left">
                <h2 className="text-xl text-center text-amber-800 font-bold">Log in!</h2>
              </div>
            </div>

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

              <div className="text-sm text-center pt-2">
                Don't have an account?
                <Link to="/register" className="text-amber-700 ml-3 font-semibold transition">
                  Register
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}