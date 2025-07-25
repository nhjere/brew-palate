
import Map, { Marker , Popup} from 'react-map-gl';

import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useState } from 'react';
import beer27 from "../assets/beer-27.svg";
import houseIcon from "../assets/house_icon.svg"

export default function BreweryMap({ breweries, center }) {

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const [selectedBrewery, setSelectedBrewery] = useState(null);

const [viewState, setViewState] = useState({
    longitude: center.lng,
    latitude: center.lat,
    zoom: 10,
});


useEffect(() => {
    if (center) {
    setViewState((prev) => ({
        ...prev,
        longitude: center.lng,
        latitude: center.lat,
    }));
    }
}, [center]);

if (!center) return null;

return (
    <div style={{ height: '500px', width: '100%' }}>
    <Map
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle="mapbox://styles/nhjere/cmddl0xe202l201s42sekazqp"
        style={{ width: '100%', height: '100%' }}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        onClick={(event) => {
        const clicked = event.originalEvent?.target;
        if (!clicked.closest('button.map-pin-button')) {
            setSelectedBrewery(null);
        }
        }}
    >
        {/* User marker */}
        <Marker
        longitude={center.lng}
        latitude={center.lat}
        color="blue">
        <img src={houseIcon} alt="house icon" className="w-6 h-6" />
        </Marker>

        {/* Brewery markers */}
        {breweries.map((brewery) =>
        brewery.longitude && brewery.latitude ? (
        <Marker
            key={brewery.breweryId}
            longitude={brewery.longitude}
            latitude={brewery.latitude}
            anchor="bottom"
        >
        <button
            onClick={() => setSelectedBrewery(brewery)}
            className="map-pin-button"
            >
            <img src={beer27} alt="Brewery Icon" className="w-6 h-6" />
            </button>
        </Marker>

        ) : null
        )}

        {selectedBrewery && (
        <Popup
            longitude={selectedBrewery.longitude}
            latitude={selectedBrewery.latitude}
            anchor="top"
            onClose={() => setSelectedBrewery(null)}
            closeButton={false}
            closeOnClick={false}
            focusAfterOpen={false}
            className="text-sm"
        >
            <div>
            <strong>{selectedBrewery.breweryName}</strong><br />
            </div>
        </Popup>
        )}
    </Map>
    </div>
);
}
