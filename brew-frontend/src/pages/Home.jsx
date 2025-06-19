import Header from '../components/header';
import "../App.css";
import React, {useState} from 'react';

export default function Home() {

    const [role, setRole] = useState('user')

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
                        <h2 className="text-xl text-amber-800 font-bold">Log in or Create an account!</h2>
                    </div>
                    </div>

                    {/* Login form */}
                    <form className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email or Username"
                        className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring focus:border-amber-500"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring focus:border-amber-500"
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-200 text-black font-bold py-2 px-4 rounded-md hover:bg-blue-300 transition"
                    >
                        Log In
                    </button>
                    
                    <div>
                        
                         Dont have an account? 

                        <button className='text-amber-700'> Register </button> 
                    </div>
                         

                    </form>

                </div>
                </div>
            </main>
        </div>
        </>
    )
}