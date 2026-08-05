import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../../styles/ExploreMap.css";

// Default India-center view when nothing has been searched yet
const DEFAULT_CENTER = [20.5937, 78.9629];
const DEFAULT_ZOOM = 5;

// Search-origin marker (city / current location pin)
const originIcon = L.divIcon({
  className: "origin-marker",
  html: `<div class="origin-marker-dot"><span>📍</span></div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 34],
});

// Build a category-colored marker icon
function buildCategoryIcon(category, isSelected) {
  return L.divIcon({
    className: "category-marker",
    html: `<div class="category-marker-dot${isSelected ? " selected" : ""}" style="background:${category.color}">
             <span>${category.icon}</span>
           </div>`,
    iconSize: isSelected ? [40, 40] : [32, 32],
    iconAnchor: isSelected ? [20, 20] : [16, 16],
  });
}

// Smoothly fly the map to a new center whenever it changes
function FlyToPosition({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (!center) return;
    map.flyTo(center, zoom ?? 13, { duration: 1.4 });
  }, [center, zoom, map]);

  return null;
}

function ExploreMap({
  position,
  places,
  selectedCategory,
  selectedPlace,
  setSelectedPlace,
  loading,
  hasSearched,
  locationLabel,
}) {
  const mapCenter = position || DEFAULT_CENTER;
  const flyTarget = selectedPlace
    ? [selectedPlace.lat, selectedPlace.lon]
    : position;
  const flyZoom = selectedPlace ? 16 : position ? 13 : DEFAULT_ZOOM;

  return (
    <div className="explore-map-wrap">
      <MapContainer
        center={mapCenter}
        zoom={DEFAULT_ZOOM}
        className="explore-map"
        scrollWheelZoom
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FlyToPosition center={flyTarget} zoom={flyZoom} />

        {position && (
          <Marker position={position} icon={originIcon}>
            <Popup>
              <strong>{locationLabel || "Searched Location"}</strong>
            </Popup>
          </Marker>
        )}

        {places.map((place) => {
          const isSelected = selectedPlace?.id === place.id;

          return (
            <Marker
              key={place.id}
              position={[place.lat, place.lon]}
              icon={buildCategoryIcon(selectedCategory, isSelected)}
              eventHandlers={{
                click: () => setSelectedPlace(place),
              }}
            >
              <Popup>
                <div className="map-popup">
                  <h3>{place.name}</h3>
                  <p className="map-popup-category">
                    {selectedCategory.icon} {selectedCategory.label} {place.distanceStr ? `• ${place.distanceStr}` : ""}
                  </p>
                  <p className="map-popup-address">{place.address}</p>
                  {place.description && (
                    <p className="map-popup-desc" style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "4px 0 8px" }}>
                      {place.description}
                    </p>
                  )}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lon}`}
                    target="_blank"
                    rel="noreferrer"
                    className="map-popup-link"
                  >
                    Open in Google Maps
                  </a>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {!hasSearched && (
        <div className="map-overlay">
          <div className="map-overlay-card">
            <span className="map-overlay-icon">🧭</span>
            <h3>Search a location to start exploring</h3>
            <p>Try a city, district, state, or country above.</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="map-overlay map-overlay-loading">
          <div className="map-overlay-card">
            <span className="map-spinner" />
            <h3>Finding nearby places...</h3>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExploreMap;