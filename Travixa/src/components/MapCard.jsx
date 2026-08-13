import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/MapCard.css";
import { geocodeLocation, isValidCoordinate, calculateSmartRouteDistance } from "../services/geocoding";

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

// Custom Marker Pins with HTML & Emoji
const createCustomMarkerIcon = (emoji, bgColor) =>
  L.divIcon({
    className: "custom-map-pin-wrapper",
    html: `<div style="background-color: ${bgColor}; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.3); font-size: 16px;">${emoji}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17],
  });

const TRANSPORT_MODES = [
  { id: "driving", label: "Drive", icon: "🚗" },
  { id: "walking", label: "Walk", icon: "🚶" },
  { id: "train", label: "Train", icon: "🚆" },
  { id: "flight", label: "Flight", icon: "✈" },
];

// Helper: Haversine distance in kilometers
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Helper: Generate a smooth curved arc polyline for Train/Flight or fallback
function generateArcPoints(startCoords, endCoords, numPoints = 40) {
  const [lat1, lon1] = startCoords;
  const [lat2, lon2] = endCoords;
  if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) return [];
  const points = [];

  const dist = haversineDistance(lat1, lon1, lat2, lon2);
  const offset = Math.min(dist * 0.0008, 2.5);

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const lat = lat1 + t * (lat2 - lat1) + Math.sin(t * Math.PI) * offset;
    const lon = lon1 + t * (lon2 - lon1);
    points.push([lat, lon]);
  }
  return points;
}

// Helper: Format duration in seconds into readable text
function formatDuration(totalSeconds) {
  if (isNaN(totalSeconds) || totalSeconds <= 0) return "N/A";
  const totalMinutes = Math.round(totalSeconds / 60);

  if (totalMinutes < 60) {
    return `${totalMinutes} mins`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    return `${days}d ${remHours}h`;
  }

  if (minutes === 0) {
    return `${hours} hrs`;
  }

  return `${hours} hrs ${minutes} mins`;
}

// Helper: Format distance in kilometers
function formatDistance(distKm) {
  if (isNaN(distKm) || distKm <= 0) return "N/A";
  if (distKm < 1) {
    return `${Math.round(distKm * 1000)} m`;
  }
  return `${distKm.toLocaleString("en-US", { maximumFractionDigits: 1 })} km`;
}

// Helper component to fit map bounds to route polyline & markers without excessive zoom-out
function MapBoundsFitter({ userCoords, destCoords, routePolyline, isDestinationSet }) {
  const map = useMap();

  useEffect(() => {
    // If no destination has been entered by the user, keep map centered on origin/user location
    if (!isDestinationSet) {
      if (userCoords && !isNaN(userCoords[0]) && !isNaN(userCoords[1])) {
        map.flyTo(userCoords, 10, { duration: 1 });
      }
      return;
    }

    // Fit bounds to polyline points if available
    if (routePolyline && routePolyline.length > 0) {
      const validPoints = routePolyline.filter(
        (p) => Array.isArray(p) && p.length === 2 && !isNaN(p[0]) && !isNaN(p[1])
      );
      if (validPoints.length > 0) {
        const bounds = L.latLngBounds(validPoints);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14, animate: true, duration: 1 });
        return;
      }
    }

    // Fallback bounds fit between userCoords & destCoords
    if (
      userCoords &&
      destCoords &&
      !isNaN(userCoords[0]) &&
      !isNaN(userCoords[1]) &&
      !isNaN(destCoords[0]) &&
      !isNaN(destCoords[1])
    ) {
      const bounds = L.latLngBounds([userCoords, destCoords]);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14, animate: true, duration: 1 });
    }
  }, [userCoords, destCoords, routePolyline, isDestinationSet, map]);

  return null;
}

function MapCard({ destination }) {
  const isDestinationSet = Boolean(destination && destination.trim().length > 0);

  const [coords, setCoords] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [loadingMap, setLoadingMap] = useState(false);

  // User Geolocation Origin Coords
  const [userCoords, setUserCoords] = useState([28.6139, 77.209]); // Default Delhi
  const [userLocationName, setUserLocationName] = useState("Delhi, India");

  // Routing State
  const [transportMode, setTransportMode] = useState("driving");
  const [routePolyline, setRoutePolyline] = useState([]);
  const [routeData, setRouteData] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState(false);

  // Refs for Request Cancellation and Stale Response Protection
  const routeRequestIdRef = useRef(0);
  const abortControllerRef = useRef(null);

  // Custom Markers Memoized
  const startIcon = useMemo(() => createCustomMarkerIcon("📍", "#0284c7"), []);
  const destIcon = useMemo(() => createCustomMarkerIcon("🏁", "#ef4444"), []);

  // Polyline Styling by Transport Mode
  const polylineOptions = useMemo(() => {
    switch (transportMode) {
      case "walking":
        return { color: "#10b981", weight: 5, opacity: 0.85, dashArray: "8, 8" };
      case "train":
        return { color: "#8b5cf6", weight: 5, opacity: 0.85, dashArray: "12, 6" };
      case "flight":
        return { color: "#f59e0b", weight: 4, opacity: 0.85, dashArray: "6, 10" };
      case "driving":
      default:
        return { color: "#0284c7", weight: 5, opacity: 0.85 };
    }
  }, [transportMode]);

  // 1. Get User Geolocation on Mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          if (isValidCoordinate(lat, lon)) {
            setUserCoords([lat, lon]);

            try {
              const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
              );
              if (res.ok) {
                const data = await res.json();
                const name =
                  data.address?.city ||
                  data.address?.town ||
                  data.address?.village ||
                  data.address?.state ||
                  "Your Location";
                setUserLocationName(name);
              }
            } catch (e) {
              // Ignore geolocation reverse error
            }
          }
        },
        () => {
          // Keep default location (Delhi) if permission denied
        }
      );
    }
  }, []);

  // 2. Single Unified Pipeline: Geocode + Route Calculation with Stale Protection
  useEffect(() => {
    if (!isDestinationSet) {
      setCoords(null);
      setLocationName("");
      setRoutePolyline([]);
      setRouteData(null);
      setRouteError(false);
      setRouteLoading(false);
      setLoadingMap(false);
      return;
    }

    const requestId = ++routeRequestIdRef.current;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const runPipeline = async () => {
      try {
        setLoadingMap(true);
        setRouteLoading(true);
        setRouteError(false);

        const routeResult = await calculateSmartRouteDistance({
          originCoords: userCoords,
          destination: destination.trim(),
          transportMode,
        });

        if (requestId !== routeRequestIdRef.current) return;

        if (!routeResult || !routeResult.destCoords) {
          setRouteError(true);
          setRoutePolyline([]);
          setRouteData(null);
          setLoadingMap(false);
          setRouteLoading(false);
          return;
        }

        setCoords(routeResult.destCoords);
        setLocationName(routeResult.destName);
        setRoutePolyline(routeResult.geometry);
        setRouteData({
          distance: routeResult.distanceText,
          duration: routeResult.durationText,
        });
      } catch (err) {
        if (err.name === "AbortError") return;
        if (requestId !== routeRequestIdRef.current) return;
        console.error("[OSRM Pipeline] Error:", err);
        setRouteError(true);
      } finally {
        if (requestId === routeRequestIdRef.current) {
          setLoadingMap(false);
          setRouteLoading(false);
        }
      }
    };

    const timer = setTimeout(runPipeline, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [destination, isDestinationSet, transportMode, userCoords]);

  return (
    <div className="map-card-preview">
      {/* Header */}
      <div className="map-card-header">
        <div>
          <span className="map-eyebrow">🗺️ LIVE MAP PREVIEW</span>
          <h3 className="map-destination-title">
            {isDestinationSet ? (
              <>📍 {destination.trim()}</>
            ) : (
              <>📍 Destination Preview</>
            )}
          </h3>
        </div>
        {loadingMap && <div className="map-spinner-badge">Searching map...</div>}
      </div>

      {/* Interactive Map Frame */}
      <div className="map-frame">
        <MapContainer
          center={isDestinationSet && coords ? coords : userCoords}
          zoom={10}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          {/* User Origin Marker */}
          {userCoords && (
            <Marker position={userCoords} icon={startIcon}>
              <Popup>
                <strong>📍 Starting Point</strong>
                <br />
                {userLocationName}
              </Popup>
            </Marker>
          )}

          {/* Destination Marker */}
          {isDestinationSet && coords && (
            <Marker position={coords} icon={destIcon}>
              <Popup>
                <strong>🏁 Destination</strong>
                <br />
                {locationName}
              </Popup>
            </Marker>
          )}

          {/* Drawn Route Polyline */}
          {isDestinationSet && routePolyline && routePolyline.length > 0 && (
            <Polyline positions={routePolyline} pathOptions={polylineOptions} />
          )}

          {/* Auto-Fit Bounds to Route & Markers */}
          <MapBoundsFitter
            userCoords={userCoords}
            destCoords={coords}
            routePolyline={routePolyline}
            isDestinationSet={isDestinationSet}
          />
        </MapContainer>
      </div>

      {/* Smart Route Planner Section */}
      <div className="smart-route-planner">
        <div className="route-planner-header">
          <span className="route-planner-title">🧭 SMART ROUTE PLANNER</span>
        </div>

        {/* Transport Mode Chips */}
        <div className="transport-chips-container">
          {TRANSPORT_MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              className={`transport-chip ${
                transportMode === mode.id ? "active" : ""
              }`}
              onClick={() => setTransportMode(mode.id)}
            >
              <span className="chip-icon">{mode.icon}</span>
              <span className="chip-label">{mode.label}</span>
            </button>
          ))}
        </div>

        {/* Route Metrics Display */}
        <div className="route-metrics-card">
          {routeLoading ? (
            <div className="route-loading-state">
              <span className="route-spinner">⏳</span>
              <span>Calculating optimal route...</span>
            </div>
          ) : routeError ? (
            <div className="route-error-state">
              <span>⚠️ Unable to calculate route.</span>
            </div>
          ) : !isDestinationSet ? (
            <div className="route-info-state">
              <span>Type a destination in the planner form to calculate route</span>
            </div>
          ) : routeData ? (
            <div className="route-metrics-grid">
              <div className="metric-box">
                <span className="metric-icon">📏</span>
                <div>
                  <span className="metric-label">DISTANCE</span>
                  <strong className="metric-value">{routeData.distance}</strong>
                </div>
              </div>

              <div className="metric-box">
                <span className="metric-icon">🕒</span>
                <div>
                  <span className="metric-label">ESTIMATED TIME</span>
                  <strong className="metric-value">{routeData.duration}</strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="route-error-state">
              <span>Unable to calculate route.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

class MapErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("MapCard Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="map-card-preview">
          <div className="map-card-header">
            <div>
              <span className="map-eyebrow">🗺️ LIVE MAP PREVIEW</span>
              <h3 className="map-destination-title">📍 Destination Preview</h3>
            </div>
          </div>
          <div
            className="map-frame"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
              textAlign: "center",
              color: "#64748b",
            }}
          >
            <div>
              <span style={{ fontSize: "2rem" }}>🗺️</span>
              <p style={{ marginTop: "10px", fontWeight: "600" }}>
                Map preview is temporarily unavailable.
              </p>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function MapCardWithErrorBoundary(props) {
  return (
    <MapErrorBoundary>
      <MapCard {...props} />
    </MapErrorBoundary>
  );
}