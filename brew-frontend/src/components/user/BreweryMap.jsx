import Map, { Marker, Popup } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useState } from "react";
import beer27 from "../../assets/beer-27.svg";
import beerkeg from "../../assets/beer-keg-real.svg";
import houseIcon from "../../assets/house_icon.svg";

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
      setViewState(prev => ({
        ...prev,
        longitude: center.lng,
        latitude: center.lat,
      }));
    }
  }, [center]);

  if (!center) return null;

  return (
    <div className="h-[480px] w-full overflow-hidden bg-[#e7edf5] ring-1 ring-[#3C547A]/15 shadow-sm">
      <Map
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle="mapbox://styles/nhjere/cmddl0xe202l201s42sekazqp"
        style={{ width: "100%", height: "100%" }}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        onClick={(event) => {
          const clicked = event.originalEvent?.target;
          if (!clicked?.closest?.("button.map-pin-button")) {
            setSelectedBrewery(null);
          }
        }}
      >
        {/* User marker */}
        <Marker longitude={center.lng} latitude={center.lat} anchor="bottom">
          <img
            src={houseIcon}
            alt="Current location"
            className="w-7 h-7 drop-shadow-md"
          />
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
                    className="map-pin-button flex items-center justify-center bg-transparent"
                >
                    {/* Explicit circular badge */}
                    <span
                    className="
                        flex items-center justify-center
                        w-6 h-6
                        rounded-full
                        bg-[#6E7F99]
                        border border-[#3C547A]/40
                        shadow-lg shadow-black/10
                    "
                    >
                    <img src={beerkeg} alt="Brewery Icon" className="w-4 h-4" />
                    </span>
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
            <div className="space-y-1">
              <a
                href={`/brewery/${selectedBrewery.breweryId}`}
                className="font-semibold text-[#3C547A] hover:underline"
              >
                {selectedBrewery.breweryName}
              </a>
              <p className="text-xs text-slate-500">
                {selectedBrewery.city}, {selectedBrewery.state}
              </p>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
