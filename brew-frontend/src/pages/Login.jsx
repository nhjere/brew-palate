import Title from '../components/Title';
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
        localStorage.setItem('brewer_id', userId);
        localStorage.setItem('user_role', 'brewer');
        navigate(`/brewer/dashboard/${userId}`, { replace: true });
      } else {
        localStorage.setItem('user_id', userId);
        localStorage.setItem('user_role', 'user');
        navigate(`/user/dashboard/${userId}`, { replace: true });
      }
    } catch (e) {
      setErrorMessage('Unable to fetch user role. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-10">
      
      {/* Title */}
      <div className="text-center mb-5">
        <Title />
        <p className="text-lg font-semibold text-slate-600 ">
          Discover craft breweries and beers near you!
        </p>
      </div>

      <main className="w-full max-w-3xl ">
        <div className="flex flex-col w-full">
          
          {/* Card */}
          <div className="w-full bg-[#f2f2f2] border border-slate-200  p-6 shadow-sm">
            
            {/* Heading */}
            <div className="flex justify-between items-start mb-4">
              <div className="text-left">
                <h2 className="text-xl text-[#8C6F52] font-bold">Log In</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Welcome back! Please enter your details.
                </p>
              </div>
            </div>

            {/* Messages */}
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

            {/* Form */}
            <form className="space-y-4" onSubmit={handleLogIn}>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                className="
                  w-full p-2 rounded-xl 
                  border border-slate-300 bg-white 
                  focus:outline-none focus:ring-2 focus:ring-[#3C547A]/40
                "
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="
                  w-full p-2 rounded-xl 
                  border border-slate-300 bg-white 
                  focus:outline-none focus:ring-2 focus:ring-[#3C547A]/40
                "
              />

              <button
                type="submit"
                className="
                  w-full bg-[#3C547A] text-white 
                  font-semibold py-2 px-4 rounded-full
                  hover:bg-[#314466] transition
                "
              >
                Log In
              </button>

              <div className="text-sm text-center pt-2 text-slate-700">
                Don't have an account?
                <Link 
                  to="/register" 
                  className="text-[#8C6F52] ml-2 font-semibold hover:underline"
                >
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
