import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../supabaseClient';

const BrewerContext = createContext();

export const useBrewerContext = () => {
    const context = useContext(BrewerContext);
    if (!context) {
        throw new Error('useBrewerContext must be used within BrewerProvider');
    }
    
    return context;
};

export const BrewerProvider = ({ children }) => {
    const [brewerId, setBrewerId] = useState(null);
    const [token, setToken] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Initialize brewer data from session
    useEffect(() => {
        const initializeBrewerData = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                
                if (session?.user) {
                    const userId = session.user.id;
                    const accessToken = session.access_token;
                    const userRole = session.user.user_metadata?.role;

                    if (userRole === 'brewer') {
                        setBrewerId(userId);
                        setToken(accessToken);
                        setIsAuthenticated(true);
                        
                        // Store in localStorage as backup
                        localStorage.setItem('brewer_id', userId);
                        localStorage.setItem('auth_token', accessToken);
                    }
                }
            } catch (error) {
                console.error('Error initializing brewer data:', error);
            } finally {
                setLoading(false);
            }
        };

        initializeBrewerData();
    }, []);

    // Login function specifically for brewers
    const loginBrewer = (userId, accessToken) => {
        setBrewerId(userId);
        setToken(accessToken);
        setIsAuthenticated(true);
        localStorage.setItem('brewer_id', userId);
        localStorage.setItem('auth_token', accessToken);
    };

    // Logout function
    const logoutBrewer = async () => {
        await supabase.auth.signOut();
        setBrewerId(null);
        setToken(null);
        setIsAuthenticated(false);
        localStorage.removeItem('brewer_id');
        localStorage.removeItem('auth_token');
    };

    const value = {
        brewerId,
        token,
        isAuthenticated,
        loading,
        loginBrewer,
        logoutBrewer
    };

    return (
        <BrewerContext.Provider value={value}>
            {children}
        </BrewerContext.Provider>
    );
};