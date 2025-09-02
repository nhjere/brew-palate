import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import BrewerHeader from '../../components/brewer/BrewerHeader.jsx';
import { useBrewerContext } from '../../context/BrewerContext';
import axios from 'axios';

export default function Analytics() {
    const { brewerId: urlBrewerId } = useParams();
    const { brewerId: contextBrewerId, token, isAuthenticated, loading } = useBrewerContext();
    const [status, setStatus] = useState({ hasBrewery: false, brewery: null });
    const [analyticsData, setAnalyticsData] = useState(null);
    const [dataLoading, setDataLoading] = useState(true);

    const BASE_URL = import.meta.env.VITE_BACKEND_URL;

    // Security check: URL brewerId must match context brewerId
    // const isAuthorized = isAuthenticated && contextBrewerId === urlBrewerId;

    // useEffect(() => {
    //     if (!isAuthorized || !token) return;

    //     const fetchData = async () => {
    //         setDataLoading(true);
    //         try {
    //             // Fetch brewery status
    //             const { data: brewerStatus } = await axios.get(
    //                 `${BASE_URL}/api/brewer/breweries/status`,
    //                 { headers: { Authorization: `Bearer ${token}` } }
    //             );
    //             setStatus(brewerStatus);

    //             // TODO: Add actual analytics API call here
    //             // const { data: analytics } = await axios.get(
    //             //     `${BASE_URL}/api/brewer/analytics/${contextBrewerId}`,
    //             //     { headers: { Authorization: `Bearer ${token}` } }
    //             // );
    //             // setAnalyticsData(analytics);

    //         } catch (e) {
    //             console.error('Failed to fetch analytics data:', e);
    //         } finally {
    //             setDataLoading(false);
    //         }
    //     };

    //     fetchData();
    // }, [BASE_URL, token, contextBrewerId, isAuthorized]);

    // // Show loading while checking authentication
    // if (loading) {
    //     return (
    //         <div className="flex items-center justify-center min-h-screen">
    //             <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-900"></div>
    //         </div>
    //     );
    // }

    // // Redirect if not authorized
    // if (!isAuthorized) {
    //     return <Navigate to="/login" replace />;
    // }

    return (
        <div className="min-h-screen w-full overflow-x-hidden bg-[#fff4e6] flex flex-col
                        pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
            <BrewerHeader />

            <div className="flex flex-col gap-5 w-full p-5">
                <section className="w-full bg-white p-4 rounded-2xl overflow-hidden border shadow-md transition-all">
                    <h2 className="text-2xl font-bold text-amber-900 mb-4">Analytics Dashboard</h2>
                    <p className="text-gray-600">Brewer ID: <strong>{contextBrewerId}</strong></p>
                    <p className="text-gray-600">URL ID: <strong>{urlBrewerId}</strong></p>
                    <p className="text-green-600">✓ Authorized Access</p>
                    
                    {dataLoading ? (
                        <p className="text-gray-600 mt-4">Loading analytics data...</p>
                    ) : (
                        <div className="mt-4">
                            <p className="text-gray-600">Analytics content will go here...</p>
                            {status.brewery && (
                                <p className="text-gray-600">
                                    Brewery: <strong>{status.brewery.name}</strong>
                                </p>
                            )}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}