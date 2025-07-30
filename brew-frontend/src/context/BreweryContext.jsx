import { createContext, useContext, useEffect, useState } from "react";
import axios from 'axios';

const BreweryContext = createContext({});

export const useBreweryMap = () => useContext(BreweryContext);

export const BreweryProvider = ({children}) => {
    const [breweryMap, setBreweryMap] = useState({})
    const BASE_URL = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
    axios.get(`${BASE_URL}/api/brewer/breweries/all`)
        .then(res => {
        const map = {};
        res.data.forEach(brewery => {
            map[brewery.breweryId] = {
            ...brewery
            };
        });
        setBreweryMap(map);
        })
        .catch(console.error);
    }, []);
    return (
        <BreweryContext.Provider value = {breweryMap}>
            {children}
        </BreweryContext.Provider>
    );
    
};
