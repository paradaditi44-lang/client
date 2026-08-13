// =====================================================
// TRAVEXA ROBUST GEOCODING SERVICE
// Multi-Stage Fallback Geocoding with Caching & Validation
// =====================================================

// In-memory cache for the current session
const geocodeCache = new Map();

// Load sessionStorage cache if available
try {
  const sessionData = sessionStorage.getItem("travexa_geocode_cache");
  if (sessionData) {
    const parsed = JSON.parse(sessionData);
    Object.entries(parsed).forEach(([k, v]) => geocodeCache.set(k, v));
  }
} catch (e) {
  // Ignore sessionStorage errors
}

// Common city / airport / country / island aliases mapping
const COMMON_ALIASES = {
  "nyc": "New York City",
  "ny": "New York City",
  "la": "Los Angeles",
  "sf": "San Francisco",
  "uk": "United Kingdom",
  "usa": "United States of America",
  "us": "United States of America",
  "uae": "United Arab Emirates",
  "kl": "Kuala Lumpur",
  "del": "Delhi",
  "bom": "Mumbai",
  "blr": "Bengaluru",
  "maa": "Chennai",
  "ccu": "Kolkata",
  "hyd": "Hyderabad",
  "bombay": "Mumbai",
  "madras": "Chennai",
  "calcutta": "Kolkata",
  "bangalore": "Bengaluru",
  "banaras": "Varanasi",
  "benaras": "Varanasi",
  "trivandrum": "Thiruvananthapuram",
  "baroda": "Vadodara",
  "cochin": "Kochi",
  "pondicherry": "Puducherry",
  "peking": "Beijing",
  "saigon": "Ho Chi Minh City",
  "spb": "Saint Petersburg",
  "rio": "Rio de Janeiro",
};

// Curated Landmark & Destination Directory for fast, accurate resolution
const LANDMARK_DIRECTORY = {
  "taj mahal": { lat: 27.1751, lon: 78.0421, name: "Taj Mahal, Agra, India" },
  "eiffel tower": { lat: 48.8584, lon: 2.2945, name: "Eiffel Tower, Paris, France" },
  "statue of liberty": { lat: 40.6892, lon: -74.0445, name: "Statue of Liberty, New York, USA" },
  "burj khalifa": { lat: 25.1972, lon: 55.2744, name: "Burj Khalifa, Dubai, UAE" },
  "colosseum": { lat: 41.8902, lon: 12.4922, name: "Colosseum, Rome, Italy" },
  "golden temple": { lat: 31.6200, lon: 74.8765, name: "Golden Temple, Amritsar, India" },
  "machu picchu": { lat: -13.1631, lon: -72.5450, name: "Machu Picchu, Peru" },
  "disneyland": { lat: 33.8121, lon: -117.9190, name: "Disneyland Resort, Anaheim, USA" },
  "disney world": { lat: 28.3852, lon: -81.5639, name: "Walt Disney World, Orlando, USA" },
  "red fort": { lat: 28.6562, lon: 77.2410, name: "Red Fort, Delhi, India" },
  "gateway of india": { lat: 18.9220, lon: 72.8347, name: "Gateway of India, Mumbai, India" },
  "hawa mahal": { lat: 26.9239, lon: 75.8267, name: "Hawa Mahal, Jaipur, India" },
  "qutub minar": { lat: 28.5245, lon: 77.1855, name: "Qutub Minar, Delhi, India" },
  "louvre": { lat: 48.8606, lon: 2.3376, name: "Louvre Museum, Paris, France" },
  "louvre museum": { lat: 48.8606, lon: 2.3376, name: "Louvre Museum, Paris, France" },
  "times square": { lat: 40.7580, lon: -73.9855, name: "Times Square, New York, USA" },
  "marina bay sands": { lat: 1.2834, lon: 103.8607, name: "Marina Bay Sands, Singapore" },
  "niagara falls": { lat: 43.0962, lon: -79.0377, name: "Niagara Falls, NY, USA" },
  "grand canyon": { lat: 36.1069, lon: -112.1129, name: "Grand Canyon National Park, Arizona, USA" },
  "yellowstone": { lat: 44.4280, lon: -110.5885, name: "Yellowstone National Park, Wyoming, USA" },
  "yosemite": { lat: 37.8651, lon: -119.5383, name: "Yosemite National Park, California, USA" },
  "santorini": { lat: 36.3932, lon: 25.4615, name: "Santorini, Greece" },
  "mykonos": { lat: 37.4467, lon: 25.3289, name: "Mykonos, Greece" },
  "goa": { lat: 15.2993, lon: 74.1240, name: "Goa, India" },
  "bali": { lat: -8.4095, lon: 115.1889, name: "Bali, Indonesia" },
  "hawaii": { lat: 19.8968, lon: -155.5828, name: "Hawaii, USA" },
  "maui": { lat: 20.7984, lon: -156.3319, name: "Maui, Hawaii, USA" },
  "maldives": { lat: 3.2028, lon: 73.2207, name: "Maldives" },
  "phuket": { lat: 7.8804, lon: 98.3923, name: "Phuket, Thailand" },
  "ibiza": { lat: 38.9067, lon: 1.4206, name: "Ibiza, Spain" },
  "kashmir": { lat: 34.0837, lon: 74.7973, name: "Kashmir, India" },
  "ladakh": { lat: 34.1526, lon: 77.5771, name: "Ladakh, India" },
  "manali": { lat: 32.2432, lon: 77.1892, name: "Manali, Himachal Pradesh, India" },
  "shimla": { lat: 31.1048, lon: 77.1734, name: "Shimla, Himachal Pradesh, India" },
  "darjeeling": { lat: 27.0410, lon: 88.2663, name: "Darjeeling, West Bengal, India" },
  "munnar": { lat: 10.0889, lon: 77.0595, name: "Munnar, Kerala, India" },
  "ooty": { lat: 11.4102, lon: 76.6950, name: "Ooty, Tamil Nadu, India" },
  "coorg": { lat: 12.3375, lon: 75.8069, name: "Coorg, Karnataka, India" },
  "rishikesh": { lat: 30.0869, lon: 78.2676, name: "Rishikesh, Uttarakhand, India" },
  "varanasi": { lat: 25.3176, lon: 82.9739, name: "Varanasi, Uttar Pradesh, India" },
  "rajasthan": { lat: 27.0238, lon: 74.2179, name: "Rajasthan, India" },
  "kerala": { lat: 10.8505, lon: 76.2711, name: "Kerala, India" },
  "california": { lat: 36.7783, lon: -119.4179, name: "California, USA" },
  "bavaria": { lat: 48.7904, lon: 11.4979, name: "Bavaria, Germany" },
  "tuscany": { lat: 43.7711, lon: 11.2486, name: "Tuscany, Italy" },
  "swiss alps": { lat: 46.5601, lon: 8.5611, name: "Swiss Alps, Switzerland" },
  "switzerland": { lat: 46.8182, lon: 8.2275, name: "Switzerland" },
  "paris": { lat: 48.8566, lon: 2.3522, name: "Paris, France" },
  "london": { lat: 51.5074, lon: -0.1278, name: "London, UK" },
  "tokyo": { lat: 35.6762, lon: 139.6503, name: "Tokyo, Japan" },
  "new york": { lat: 40.7128, lon: -74.0060, name: "New York City, NY, USA" },
  "new york city": { lat: 40.7128, lon: -74.0060, name: "New York City, NY, USA" },
  "los angeles": { lat: 34.0522, lon: -118.2437, name: "Los Angeles, CA, USA" },
  "dubai": { lat: 25.2048, lon: 55.2708, name: "Dubai, UAE" },
  "singapore": { lat: 1.3521, lon: 103.8198, name: "Singapore" },
  "rome": { lat: 41.9028, lon: 12.4964, name: "Rome, Italy" },
  "sydney": { lat: -33.8688, lon: 151.2093, name: "Sydney, Australia" },
  "mumbai": { lat: 19.0760, lon: 72.8777, name: "Mumbai, Maharashtra, India" },
  "delhi": { lat: 28.6139, lon: 77.2090, name: "New Delhi, Delhi, India" },
  "new delhi": { lat: 28.6139, lon: 77.2090, name: "New Delhi, Delhi, India" },
  "bengaluru": { lat: 12.9716, lon: 77.5946, name: "Bengaluru, Karnataka, India" },
  "jaipur": { lat: 26.9124, lon: 75.7873, name: "Jaipur, Rajasthan, India" },
  "pune": { lat: 18.5204, lon: 73.8567, name: "Pune, Maharashtra, India" },
  "nashik": { lat: 19.9975, lon: 73.7898, name: "Nashik, Maharashtra, India" },
};

// Helper: Normalize user search input
export function normalizeQuery(query) {
  if (!query || typeof query !== "string") return "";

  let cleaned = query.trim().toLowerCase();

  // Strip common fluff phrases
  cleaned = cleaned
    .replace(/^(trip to|visit|tour of|travel to|vacation in|hotels in|things to do in)\s+/i, "")
    .replace(/\s+(trip|vacation|tour|holiday)$/i, "")
    .trim();

  // Check alias dictionary
  if (COMMON_ALIASES[cleaned]) {
    cleaned = COMMON_ALIASES[cleaned].toLowerCase();
  }

  return cleaned;
}

// Validate coordinate pair
export function isValidCoordinate(lat, lon) {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);
  return (
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    Math.abs(latitude) <= 90 &&
    Math.abs(longitude) <= 180 &&
    !(latitude === 0 && longitude === 0)
  );
}

// Main Geocoding function with caching and multi-level fallbacks
export async function geocodeLocation(rawQuery) {
  const normalized = normalizeQuery(rawQuery);
  if (!normalized) return null;

  // 1. Check Memory Cache
  if (geocodeCache.has(normalized)) {
    return geocodeCache.get(normalized);
  }

  // 2. Check Landmark Directory
  if (LANDMARK_DIRECTORY[normalized]) {
    const item = LANDMARK_DIRECTORY[normalized];
    const result = {
      lat: item.lat,
      lon: item.lon,
      displayName: item.name,
      query: rawQuery,
    };
    geocodeCache.set(normalized, result);
    return result;
  }

  // Also check if normalized query contains any known landmark key
  for (const [key, item] of Object.entries(LANDMARK_DIRECTORY)) {
    if (normalized.includes(key)) {
      const result = {
        lat: item.lat,
        lon: item.lon,
        displayName: item.name,
        query: rawQuery,
      };
      geocodeCache.set(normalized, result);
      return result;
    }
  }

  // 3. Level 1: Primary Nominatim Search API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=3&addressdetails=1&q=${encodeURIComponent(
        rawQuery.trim()
      )}`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        for (const item of data) {
          const lat = parseFloat(item.lat);
          const lon = parseFloat(item.lon);
          if (isValidCoordinate(lat, lon)) {
            const result = {
              lat,
              lon,
              displayName: item.display_name || rawQuery,
              query: rawQuery,
            };
            geocodeCache.set(normalized, result);
            saveCacheToSession();
            return result;
          }
        }
      }
    }
  } catch (err) {
    console.warn("Primary Nominatim lookup failed/timed out for:", rawQuery, err.message);
  }

  // 4. Level 2: Structured Nominatim Search API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=3&city=${encodeURIComponent(
        normalized
      )}`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);
        if (isValidCoordinate(lat, lon)) {
          const result = {
            lat,
            lon,
            displayName: item.display_name || rawQuery,
            query: rawQuery,
          };
          geocodeCache.set(normalized, result);
          saveCacheToSession();
          return result;
        }
      }
    }
  } catch (err) {
    console.warn("Structured Nominatim lookup failed:", rawQuery, err.message);
  }

  // 5. Level 3: Photon API Fallback (Komoot Geocoding)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(normalized)}&limit=3`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.features) && data.features.length > 0) {
        const feature = data.features[0];
        const [lon, lat] = feature.geometry.coordinates;
        if (isValidCoordinate(lat, lon)) {
          const props = feature.properties || {};
          const nameParts = [props.name, props.city, props.state, props.country].filter(Boolean);
          const result = {
            lat,
            lon,
            displayName: nameParts.join(", ") || rawQuery,
            query: rawQuery,
          };
          geocodeCache.set(normalized, result);
          saveCacheToSession();
          return result;
        }
      }
    }
  } catch (err) {
    console.warn("Photon lookup failed for:", rawQuery, err.message);
  }

  return null;
}

// Persist cache to sessionStorage
function saveCacheToSession() {
  try {
    const obj = {};
    geocodeCache.forEach((v, k) => {
      obj[k] = v;
    });
    sessionStorage.setItem("travexa_geocode_cache", JSON.stringify(obj));
  } catch (e) {
    // Ignore storage limit errors
  }
}

/**
 * Calculates real road distance (in km) using OSRM for a sequence of points / itinerary.
 */
export async function calculateItineraryDistance({ originCoords, places = [], destination = "" }) {
  const routeCoords = [];

  // 1. If valid origin coords are provided (e.g. from user geolocation), use as start
  if (originCoords && isValidCoordinate(originCoords[0], originCoords[1])) {
    routeCoords.push({ name: "Starting Point", lat: originCoords[0], lon: originCoords[1] });
  }

  // 2. Geocode destination if provided
  let destGeo = null;
  if (destination && typeof destination === "string" && destination.trim()) {
    destGeo = await geocodeLocation(destination.trim());
    if (destGeo && isValidCoordinate(destGeo.lat, destGeo.lon) && routeCoords.length === 0) {
      routeCoords.push({ name: destGeo.displayName || destination, lat: destGeo.lat, lon: destGeo.lon });
    }
  }

  // 3. Geocode itinerary places
  if (Array.isArray(places) && places.length > 0) {
    for (const place of places) {
      if (!place || typeof place !== "string" || !place.trim()) continue;
      const geo = await geocodeLocation(place.trim());
      if (geo && isValidCoordinate(geo.lat, geo.lon)) {
        const last = routeCoords[routeCoords.length - 1];
        if (!last || Math.abs(last.lat - geo.lat) > 0.001 || Math.abs(last.lon - geo.lon) > 0.001) {
          routeCoords.push({ name: geo.displayName || place, lat: geo.lat, lon: geo.lon });
        }
      }
    }
  }

  // Append destination at the end if not already present
  if (destGeo && isValidCoordinate(destGeo.lat, destGeo.lon) && routeCoords.length > 0) {
    const last = routeCoords[routeCoords.length - 1];
    if (Math.abs(last.lat - destGeo.lat) > 0.001 || Math.abs(last.lon - destGeo.lon) > 0.001) {
      routeCoords.push({ name: destGeo.displayName || destination, lat: destGeo.lat, lon: destGeo.lon });
    }
  }

  if (import.meta.env?.DEV) {
    console.log("Distance calculation:");
    console.log("Route points:", routeCoords);
  }

  if (routeCoords.length < 2) {
    if (import.meta.env?.DEV) {
      console.log("Total distance (km): null (Insufficient route waypoints)");
    }
    return null;
  }

  const osrmWaypoints = routeCoords.map((pt) => `${pt.lon},${pt.lat}`).join(";");
  const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${osrmWaypoints}?overview=false`;

  try {
    const res = await fetch(osrmUrl);
    if (res.ok) {
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const distanceMeters = data.routes[0].distance || 0;
        if (distanceMeters > 0) {
          const totalDistanceKm = distanceMeters / 1000;
          if (import.meta.env?.DEV) {
            console.log("Total distance (km):", totalDistanceKm);
          }
          return totalDistanceKm;
        }
      }
    }
  } catch (err) {
    if (import.meta.env?.DEV) {
      console.warn("OSRM distance calculation error:", err.message);
    }
  }

  return null;
}

/**
 * Formats numeric kilometer distance into readable string adhering to rounding rules:
 * - Under 10 km -> 1 decimal place (e.g., "8.4 km")
 * - 10 km or more -> nearest whole kilometer (e.g., "145 km")
 * - Unavailable / null -> "Distance unavailable"
 */
export function formatTotalDistanceText(distKm) {
  if (distKm === null || distKm === undefined || isNaN(distKm) || Number(distKm) <= 0) {
    return "Distance unavailable";
  }
  const num = Number(distKm);
  if (num < 10) {
    return `${num.toFixed(1)} km`;
  }
  return `${Math.round(num)} km`;
}

/**
 * Single Authoritative Route Distance Calculation Function.
 * Accepts origin coordinates [lat, lon], destination name/coords, and travel mode.
 * Returns: { distanceKm, distanceText, durationMinutes, durationText, geometry, destCoords }
 */
export async function calculateSmartRouteDistance({ originCoords, destination, transportMode = "driving" }) {
  if (!destination || typeof destination !== "string" || !destination.trim()) {
    return {
      distanceKm: null,
      distanceText: "Distance unavailable",
      durationMinutes: null,
      durationText: "N/A",
      geometry: [],
      destCoords: null,
    };
  }

  // 1. Geocode destination
  const destGeo = await geocodeLocation(destination.trim());
  if (!destGeo || !isValidCoordinate(destGeo.lat, destGeo.lon)) {
    return {
      distanceKm: null,
      distanceText: "Distance unavailable",
      durationMinutes: null,
      durationText: "N/A",
      geometry: [],
      destCoords: null,
    };
  }

  const destLat = destGeo.lat;
  const destLon = destGeo.lon;

  // 2. Validate Origin (default to Delhi [28.6139, 77.209] if originCoords not set or invalid)
  const [origLat, origLon] =
    originCoords && isValidCoordinate(originCoords[0], originCoords[1])
      ? originCoords
      : [28.6139, 77.209];

  // 3. Request OSRM route in strict longitude,latitude order
  const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${origLon},${origLat};${destLon},${destLat}?overview=full&geometries=geojson`;

  try {
    const res = await fetch(osrmUrl);
    if (res.ok) {
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const rawCoords = route.geometry?.coordinates || [];

        // Convert GeoJSON [longitude, latitude] to Leaflet [latitude, longitude]
        const geometry = rawCoords
          .filter(
            (pt) =>
              Array.isArray(pt) &&
              pt.length >= 2 &&
              !isNaN(pt[0]) &&
              !isNaN(pt[1])
          )
          .map(([longitude, latitude]) => [latitude, longitude]);

        const distanceMeters = route.distance || 0;
        const durationSec = route.duration || 0;

        const distanceKm = distanceMeters > 0 ? distanceMeters / 1000 : null;
        const distanceText = formatTotalDistanceText(distanceKm);

        const totalMinutes = Math.round(durationSec / 60);
        let durationText = "N/A";
        if (totalMinutes < 60) {
          durationText = `${totalMinutes} mins`;
        } else {
          const hours = Math.floor(totalMinutes / 60);
          const mins = totalMinutes % 60;
          if (hours >= 24) {
            const days = Math.floor(hours / 24);
            const remHours = hours % 24;
            durationText = `${days}d ${remHours}h`;
          } else {
            durationText = mins > 0 ? `${hours} hrs ${mins} mins` : `${hours} hrs`;
          }
        }

        if (import.meta.env?.DEV) {
          console.log("TRIP ROUTE DEBUG", {
            origin: `${origLat},${origLon}`,
            destination: destination.trim(),
            distanceKm,
            durationMinutes: totalMinutes,
          });
        }

        return {
          distanceKm,
          distanceText,
          durationMinutes: totalMinutes,
          durationText,
          geometry,
          destCoords: [destLat, destLon],
          destName: (destGeo.displayName || destination).split(",").slice(0, 2).join(",").trim(),
        };
      }
    }
  } catch (err) {
    if (import.meta.env?.DEV) {
      console.warn("[OSRM Routing] Error:", err.message);
    }
  }

  return {
    distanceKm: null,
    distanceText: "Distance unavailable",
    durationMinutes: null,
    durationText: "N/A",
    geometry: [],
    destCoords: [destLat, destLon],
    destName: (destGeo.displayName || destination).split(",").slice(0, 2).join(",").trim(),
  };
}
