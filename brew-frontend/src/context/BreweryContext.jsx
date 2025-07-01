import { createContext, useContext, useEffect, useState } from "react";
import axios from 'axios';

const BreweryContext = createContext({});

export const useBreweryMap = () => useContext(BreweryContext);

export const BreweryProvider = ({children}) => {
    const [breweryMap, setBreweryMap] = useState({})

    useEffect(() => {
        axios.get('http://localhost:8080/api/import/show-breweries?page=0&size=1000')
        .then(res => {
            const map = {};
            res.data.content.forEach(brewery => {
            map[brewery.externalBreweryId] = {
                name: brewery.name,
                city: brewery.city,
                state: brewery.state,
                breweryId: brewery.breweryId,
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
