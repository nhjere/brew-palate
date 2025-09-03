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
                    
                    // Check role from localStorage first, then user_metadata
                    const userRole = localStorage.getItem('user_role') || 
                                   session.user.user_metadata?.role;

                    if (userRole === 'brewer') {
                        setBrewerId(userId);
                        setToken(accessToken);
                        setIsAuthenticated(true);
                        
                        // Store in localStorage for consistency
                        localStorage.setItem('brewer_id', userId);
                        localStorage.setItem('user_role', 'brewer');
                    }
                } else {
                    // Clear state if no session
                    setBrewerId(null);
                    setToken(null);
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error('Error initializing brewer data:', error);
                setBrewerId(null);
                setToken(null);
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        initializeBrewerData();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') {
                setBrewerId(null);
                setToken(null);
                setIsAuthenticated(false);
                localStorage.removeItem('brewer_id');
                localStorage.removeItem('user_role');
            } else if (event === 'SIGNED_IN' && session?.user) {
                const userRole = localStorage.getItem('user_role') || 
                               session.user.user_metadata?.role;
                
                if (userRole === 'brewer') {
                    setBrewerId(session.user.id);
                    setToken(session.access_token);
                    setIsAuthenticated(true);
                    localStorage.setItem('brewer_id', session.user.id);
                    localStorage.setItem('user_role', 'brewer');
                }
            }
        });

        return () => subscription?.unsubscribe();
    }, []);

    // Check if brewer is authorized for a specific brewerId
    const isAuthorizedFor = (urlBrewerId) => {
        return isAuthenticated && brewerId === urlBrewerId;
    };

    // Login function specifically for brewers
    const loginBrewer = (userId, accessToken) => {
        setBrewerId(userId);
        setToken(accessToken);
        setIsAuthenticated(true);
        localStorage.setItem('brewer_id', userId);
        localStorage.setItem('user_role', 'brewer');
    };

    // Logout function
    const logoutBrewer = async () => {
        try {
            await supabase.auth.signOut();
            setBrewerId(null);
            setToken(null);
            setIsAuthenticated(false);
            localStorage.removeItem('brewer_id');
            localStorage.removeItem('user_role');
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    const value = {
        brewerId,
        token,
        isAuthenticated,
        loading,
        isAuthorizedFor,
        loginBrewer,
        logoutBrewer
    };

    return (
        <BrewerContext.Provider value={value}>
            {children}
        </BrewerContext.Provider>
    );
};