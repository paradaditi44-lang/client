import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../../styles/ExploreMap.css";

// ==============================
// Fix Leaflet marker icons
// ==============================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",

  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",

  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// ==============================
// Category Mapping
// ==============================

const categoryMap = {
  Attractions: {
    key: "tourism",
    value: "attraction",
  },

  Restaurants: {
    key: "amenity",
    value: "restaurant",
  },

  Cafes: {
    key: "amenity",
    value: "cafe",
  },

  Hotels: {
    key: "tourism",
    value: "hotel",
  },

  Parks: {
    key: "leisure",
    value: "park",
  },

  Petrol: {
    key: "amenity",
    value: "fuel",
  },

  Hospitals: {
    key: "amenity",
    value: "hospital",
  },

  ATM: {
    key: "amenity",
    value: "atm",
  },

  Railway: {
    key: "railway",
    value: "station",
  },

  Shopping: {
    key: "shop",
    value: "mall",
  },
};
// ==============================
// Fly animation
// ==============================

function ChangeView({ center }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(center, 13, {
      duration: 2,
    });
  }, [center, map]);

  return null;
}

// ==============================
// Main Component
// ==============================

function ExploreMap({
  searchPlace,
  selectedCategory,
  userLocation,
  places,
  setPlaces,
}) {
  const [position, setPosition] = useState([
    20.5937,
    78.9629,
  ]);

  // ===========================
  // Search City
  // ===========================

  useEffect(() => {
    if (!searchPlace) return;

    async function loadLocation() {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            searchPlace
          )}&limit=1`
        );

        const data = await response.json();

        if (data.length === 0) return;

        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);

        setPosition([lat, lon]);

        // ===========================
        // Load nearby places
        // ===========================

        const category =
          categoryMap[selectedCategory] ||
          categoryMap.tourism;

        const query = `
[out:json];
(
node["${category.key}"="${category.value}"](around:5000,${lat},${lon});
way["${category.key}"="${category.value}"](around:5000,${lat},${lon});
relation["${category.key}"="${category.value}"](around:5000,${lat},${lon});
);
out center;
`;
console.log("Selected Category:", selectedCategory);
console.log("Latitude:", lat);
console.log("Longitude:", lon);
       const nearbyResponse = await fetch(
  "https://overpass-api.de/api/interpreter",
  {
    method: "POST",
    body: query,
  }
);

const nearbyData = await nearbyResponse.json();

// Check what the API returns
console.log("Nearby Places:", nearbyData);

setPlaces(
  nearbyData.elements || []
);
      } catch (error) {
        console.log(error);
      }
    }

    loadLocation();
  }, [
    searchPlace,
    selectedCategory,
    setPlaces,
  ]);

  // ===========================
  // Current Location
  // ===========================

  useEffect(() => {
    if (userLocation) {
      setPosition(userLocation);
    }
  }, [userLocation]);

  return (
    <div className="explore-map">

      <MapContainer
        center={position}
        zoom={5}
        style={{
          width: "100%",
          height: "600px",
          borderRadius: "18px",
        }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ChangeView center={position} />

        {/* Search Marker */}

        <Marker position={position}>
          <Popup>
            <strong>
              {searchPlace || "Current Location"}
            </strong>
          </Popup>
        </Marker>

        {/* Nearby Places */}

        {places.map((place) => {
          const lat =
            place.lat || place.center?.lat;

          const lon =
            place.lon || place.center?.lon;

          if (!lat || !lon) return null;

          return (
            <Marker
              key={place.id}
              position={[lat, lon]}
            >
              <Popup>

                <h3>
                  {place.tags?.name ||
                    "Unnamed Place"}
                </h3>

                <p>
                  Category:
                  {" "}
                  {selectedCategory}
                </p>

                {place.tags?.addr_street && (
                  <p>
                    {place.tags.addr_street}
                  </p>
                )}

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${lat},${lon}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open in Google Maps
                </a>

              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

    </div>
  );
}

export default ExploreMap;