import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const BeerContext = createContext({});

export const useBeerMap = () => useContext(BeerContext);

export const BeerProvider = ({ children }) => {
  const [beerMap, setBeerMap] = useState({});

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/import/all-beers")
      .then((res) => {
        const map = {};
        res.data.forEach((beer) => {
          map[beer.beerId] = {
            name: beer.name,
            style: beer.style,
            flavorTags: beer.flavorTags,
            abv: beer.abv,
            ibu: beer.ibu,
            breweryId: beer.breweryUuid,
            ...beer,
          };
        });
        setBeerMap(map);
      })
      .catch(console.error);
  }, []);

  return (
    <BeerContext.Provider value={[beerMap, setBeerMap]}>
      {children}
    </BeerContext.Provider>
  );
};
