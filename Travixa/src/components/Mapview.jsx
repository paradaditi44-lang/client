import React, { useEffect, useState } from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";
import { geocodeLocation, isValidCoordinate } from "../services/geocoding";

// =====================================================
// FIX LEAFLET MARKERS
// =====================================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",

  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",

  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// =====================================================
// FIT MAP TO ROUTE
// =====================================================

function MapController({ routeCoords }) {
  const map = useMap();

  useEffect(() => {
    if (routeCoords && routeCoords.length > 0) {
      const bounds = L.latLngBounds(routeCoords);

      map.fitBounds(bounds, {
        padding: [40, 40],
      });
    }
  }, [routeCoords, map]);

  return null;
}

// =====================================================
// CALCULATE AIR DISTANCE
// =====================================================

function calculateAirDistance(
  lat1,
  lon1,
  lat2,
  lon2
) {
  const R = 6371;

  const dLat =
    ((lat2 - lat1) * Math.PI) / 180;

  const dLon =
    ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(
      (lat1 * Math.PI) / 180
    ) *
      Math.cos(
        (lat2 * Math.PI) / 180
      ) *
      Math.sin(dLon / 2) ** 2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return R * c;
}

// =====================================================
// FORMAT DURATION
// =====================================================

function formatDuration(totalHours) {
  const hours = Math.floor(totalHours);

  const minutes = Math.round(
    (totalHours - hours) * 60
  );

  if (hours === 0) {
    return `${minutes} mins`;
  }

  if (minutes === 0) {
    return `${hours} hrs`;
  }

  return `${hours} hrs ${minutes} mins`;
}

// =====================================================
// MAIN COMPONENT
// =====================================================

function MapView({
  from,
  to,

  setLoading,

  distance,
  setDistance,

  duration,
  setDuration,

  travelMode,
  setTravelMode,
}) {
  const [
    fromCoords,
    setFromCoords,
  ] = useState(null);

  const [
    toCoords,
    setToCoords,
  ] = useState(null);

  const [
    routePolyline,
    setRoutePolyline,
  ] = useState([]);

  const [
    error,
    setError,
  ] = useState("");

  // =====================================================
  // FETCH LOCATION AND ROUTE
  // =====================================================

  useEffect(() => {
    const fetchRouteData = async () => {
      if (!from || !to) {
        return;
      }

      if (setLoading) {
        setLoading(true);
      }

      setError("");

      setRoutePolyline([]);

      setDistance("Calculating...");

      setDuration("Calculating...");

      try {
        // =================================================
        // SEARCH STARTING LOCATION AND DESTINATION
        // =================================================

        const [fromGeo, toGeo] = await Promise.all([
          geocodeLocation(from),
          geocodeLocation(to),
        ]);

        if (
          !fromGeo ||
          !toGeo ||
          !isValidCoordinate(fromGeo.lat, fromGeo.lon) ||
          !isValidCoordinate(toGeo.lat, toGeo.lon)
        ) {
          setError(
            "Location not found. Please check spelling or enter a valid city or attraction."
          );

          setFromCoords(null);
          setToCoords(null);
          setDistance("Not available");
          setDuration("Not available");
          return;
        }

        const lat1 = fromGeo.lat;
        const lon1 = fromGeo.lon;
        const lat2 = toGeo.lat;
        const lon2 = toGeo.lon;

        const start = [lat1, lon1];
        const end = [lat2, lon2];

        setFromCoords(start);
        setToCoords(end);

        // =================================================
        // FLIGHT ROUTE
        // =================================================

        if (travelMode === "flight") {
          const airDistance =
            calculateAirDistance(
              lat1,
              lon1,
              lat2,
              lon2
            );

          // Flight distance is usually slightly longer
          // than straight-line distance

          const estimatedFlightDistance =
            airDistance * 1.05;

          setRoutePolyline([
            start,
            end,
          ]);

          setDistance(
            `${Math.round(
              estimatedFlightDistance
            ).toLocaleString(
              "en-IN"
            )} km`
          );

          // Average flight speed + airport time

          const flightHours =
            estimatedFlightDistance /
              700 +
            1.5;

          setDuration(
            formatDuration(
              flightHours
            )
          );

          return;
        }

        // =================================================
        // ROAD ROUTE
        // =================================================

        if (import.meta.env?.DEV) {
          console.log(`[OSRM Routing MapView] Destination: ${to}`);
          console.log(`[OSRM Routing MapView] Destination coordinates: latitude = ${lat2}, longitude = ${lon2}`);
          console.log(`[OSRM Routing MapView] OSRM coordinates: ${lon1},${lat1};${lon2},${lat2}`);
        }

        const osrmResponse =
          await fetch(
            `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=full&geometries=geojson`
          );

        const osrmData =
          await osrmResponse.json();

        // =================================================
        // ROUTE NOT FOUND
        // =================================================

        if (
          !osrmData.routes ||
          osrmData.routes.length === 0
        ) {
          setError(
            "Unable to find a road route between these locations."
          );

          setDistance("Not available");

          setDuration("Not available");

          setRoutePolyline([
            start,
            end,
          ]);

          return;
        }

        // =================================================
        // GET ACTUAL ROAD ROUTE
        // =================================================

        const route =
          osrmData.routes[0];

        const coords =
          route.geometry.coordinates.map(
            (coordinate) => [
              coordinate[1],
              coordinate[0],
            ]
          );

        const roadDistance =
          route.distance / 1000;

        setRoutePolyline(coords);

        // =================================================
        // DISTANCE
        // =================================================

        setDistance(
          `${roadDistance.toFixed(
            1
          )} km`
        );

        // =================================================
        // ESTIMATE TIME BY TRAVEL MODE
        // =================================================

        let speed = 45;

        if (travelMode === "driving") {
          speed = 45;
        }

        if (travelMode === "train") {
          speed = 55;
        }

        if (travelMode === "walking") {
          speed = 5;
        }

        const estimatedHours =
          roadDistance / speed;

        setDuration(
          formatDuration(
            estimatedHours
          )
        );
      } catch (error) {
        console.error(
          "Routing error:",
          error
        );

        setError(
          "Unable to load route. Please try again."
        );

        setDistance(
          "Not available"
        );

        setDuration(
          "Not available"
        );
      } finally {
        if (setLoading) {
          setLoading(false);
        }
      }
    };

    fetchRouteData();
  }, [
    from,
    to,
    travelMode,
    setLoading,
    setDistance,
    setDuration,
  ]);

  // =====================================================
  // OPEN GOOGLE MAPS
  // =====================================================

  const openGoogleMaps = () => {
    const googleMapsUrl =
      `https://www.google.com/maps/dir/${encodeURIComponent(
        from
      )}/${encodeURIComponent(
        to
      )}`;

    window.open(
      googleMapsUrl,
      "_blank"
    );
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "15px",
      }}
    >
      {/* ================================================
          TRAVEL MODE
      ================================================= */}

      <div
        style={{
          background: "white",
          padding: "14px 20px",
          borderRadius: "14px",
          border:
            "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent:
            "space-between",
          flexWrap: "wrap",
          gap: "12px",
          boxShadow:
            "0 2px 8px rgba(0,0,0,0.03)",
        }}
      >
        <span
          style={{
            fontSize: "0.9rem",
            fontWeight: "bold",
            color: "#475569",
          }}
        >
          Mode of Travel
        </span>

        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          {[
            {
              id: "driving",
              label: "Driving",
              icon: "🚗",
            },

            {
              id: "flight",
              label: "Flight",
              icon: "✈️",
            },

            {
              id: "train",
              label: "Train",
              icon: "🚆",
            },

            {
              id: "walking",
              label: "Walking",
              icon: "🚶",
            },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() =>
                setTravelMode(
                  mode.id
                )
              }
              style={{
                background:
                  travelMode ===
                  mode.id
                    ? "#0284c7"
                    : "#f1f5f9",

                color:
                  travelMode ===
                  mode.id
                    ? "white"
                    : "#334155",

                border: "none",

                padding:
                  "8px 14px",

                borderRadius:
                  "8px",

                fontWeight:
                  "bold",

                cursor:
                  "pointer",
              }}
            >
              {mode.icon}{" "}
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* ================================================
          ROUTE INFORMATION
      ================================================= */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "1fr 1fr 1fr",
          gap: "15px",
          background: "white",
          padding: "18px 20px",
          borderRadius: "14px",
          border:
            "1px solid #e2e8f0",
          boxShadow:
            "0 4px 12px rgba(0,0,0,0.03)",
        }}
      >
        {/* ROUTE */}

        <div
          style={{
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontSize: "0.75rem",
              color: "#64748b",
              fontWeight: "bold",
            }}
          >
            ROUTE
          </span>

          <div
            style={{
              fontWeight: "bold",
              color: "#0f172a",
              marginTop: "5px",
            }}
          >
            {from} → {to}
          </div>
        </div>

        {/* DISTANCE */}

        <div
          style={{
            textAlign: "center",
            borderLeft:
              "1px solid #e2e8f0",
            borderRight:
              "1px solid #e2e8f0",
          }}
        >
          <span
            style={{
              fontSize: "0.75rem",
              color: "#64748b",
              fontWeight: "bold",
            }}
          >
            DISTANCE
          </span>

          <div
            style={{
              fontSize: "1.1rem",
              fontWeight: "bold",
              color: "#0284c7",
              marginTop: "5px",
            }}
          >
            {distance}
          </div>
        </div>

        {/* TIME */}

        <div
          style={{
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontSize: "0.75rem",
              color: "#64748b",
              fontWeight: "bold",
            }}
          >
            ESTIMATED TIME
          </span>

          <div
            style={{
              fontSize: "1.1rem",
              fontWeight: "bold",
              color: "#10b981",
              marginTop: "5px",
            }}
          >
            {duration}
          </div>
        </div>
      </div>

      {/* ================================================
          ERROR MESSAGE
      ================================================= */}

      {error && (
        <div
          style={{
            background: "#fee2e2",
            color: "#b91c1c",
            padding: "12px",
            borderRadius: "10px",
            textAlign: "center",
          }}
        >
          {error}
        </div>
      )}

      {/* ================================================
          MAP
      ================================================= */}

      {fromCoords &&
        toCoords && (
          <div
            style={{
              height: "400px",
              width: "100%",
              borderRadius: "16px",
              overflow: "hidden",
              border:
                "1px solid #cbd5e1",
            }}
          >
            <MapContainer
              center={fromCoords}
              zoom={5}
              style={{
                height: "100%",
                width: "100%",
              }}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors &copy; CARTO"
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              />

              {/* START MARKER */}

              <Marker
                position={fromCoords}
              >
                <Popup>
                  Starting Location:
                  <br />

                  <strong>
                    {from}
                  </strong>
                </Popup>
              </Marker>

              {/* DESTINATION MARKER */}

              <Marker
                position={toCoords}
              >
                <Popup>
                  Destination:
                  <br />

                  <strong>
                    {to}
                  </strong>
                </Popup>
              </Marker>

              {/* ROUTE LINE */}

              {routePolyline.length >
                0 && (
                <Polyline
                  positions={
                    routePolyline
                  }
                  color="#0284c7"
                  weight={5}
                  dashArray={
                    travelMode ===
                    "flight"
                      ? "8, 8"
                      : undefined
                  }
                />
              )}

              {/* FIT MAP */}

              <MapController
                routeCoords={
                  routePolyline.length >
                  0
                    ? routePolyline
                    : [
                        fromCoords,
                        toCoords,
                      ]
                }
              />
            </MapContainer>
          </div>
        )}

      {/* ================================================
          GOOGLE MAPS BUTTON
      ================================================= */}

      <button
        onClick={
          openGoogleMaps
        }
        style={{
          width: "100%",
          padding: "13px",
          background: "#4285F4",
          color: "white",
          border: "none",
          borderRadius: "10px",
          fontSize: "0.95rem",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        Open Route in Google Maps
      </button>
    </div>
  );
}

export default MapView;