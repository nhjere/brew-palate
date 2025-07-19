// src/components/BreweryMap.jsx
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function BreweryMap({ breweries, center }) {
  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

  return (
    <div style={{ height: '500px', width: '100%' }}>
      <Map
        initialViewState={{
          longitude: center.lng,
          latitude: center.lat,
          zoom: 10,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        {breweries.map((brewery) =>
          brewery.longitude && brewery.latitude ? (
            <Marker
              key={brewery.breweryId}
              longitude={brewery.longitude}
              latitude={brewery.latitude}
              color="red"
            />
          ) : null
        )}
      </Map>
    </div>
  );
}
