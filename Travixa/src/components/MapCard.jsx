import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/MapCard.css";

// Fix Leaflet Default Icon path issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function MapRecenter({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords && coords[0] && coords[1]) {
      map.flyTo(coords, 10, { duration: 1.5 });
    }
  }, [coords, map]);
  return null;
}

function MapCard({ destination }) {
  const [coords, setCoords] = useState([48.8566, 2.3522]); // Default Paris
  const [locationName, setLocationName] = useState("Paris, France");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!destination || !destination.trim()) return;

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
            destination.trim()
          )}`
        );
        const data = await res.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          setCoords([lat, lon]);
          const parts = data[0].display_name.split(",");
          setLocationName(parts.slice(0, 2).join(",").trim());
        }
      } catch (err) {
        console.error("Map preview geocoding error:", err);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [destination]);

  return (
    <div className="map-card-preview">
      {/* Header */}
      <div className="map-card-header">
        <div>
          <span className="map-eyebrow">🗺️ LIVE MAP PREVIEW</span>
          <h3 className="map-destination-title">
            {destination && destination.trim() ? (
              <>📍 {destination.trim()}</>
            ) : (
              <>📍 Destination Preview</>
            )}
          </h3>
        </div>
        {loading && <div className="map-spinner-badge">Searching map...</div>}
      </div>

      {/* Interactive Map Frame */}
      <div className="map-frame">
        <MapContainer
          center={coords}
          zoom={10}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <Marker position={coords}>
            <Popup>
              <strong>{destination || "Destination"}</strong>
              <br />
              {locationName}
            </Popup>
          </Marker>
          <MapRecenter coords={coords} />
        </MapContainer>
      </div>

      {/* Footer Info */}
      <div className="map-card-footer">
        <span className="map-status-dot"></span>
        <span className="map-footer-text">
          {destination && destination.trim()
            ? `Marker set for ${locationName}`
            : "Type a destination in the planner form to update live map"}
        </span>
        <span className="map-coords-badge">
          {coords[0].toFixed(2)}°N, {coords[1].toFixed(2)}°E
        </span>
      </div>
    </div>
  );
}

export default MapCard;