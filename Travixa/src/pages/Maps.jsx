import { useState, useRef, useEffect } from "react";

import MapSearch from "../components/maps/MapSearch";
import CategoryFilter from "../components/maps/CategoryFilter";
import ExploreMap from "../components/maps/ExploreMap";
import ExploreSidebar from "../components/maps/ExploreSidebar";
import Footer from "../components/Footer";
import { EXPLORE_CATEGORIES, DEFAULT_CATEGORY } from "../utils/explorecategories";

import "../styles/Maps.css";

function Maps() {
  const [searchInput, setSearchInput] = useState("");
  const [locationLabel, setLocationLabel] = useState("");
  const [position, setPosition] = useState(null); // [lat, lon] once a location is resolved
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(DEFAULT_CATEGORY);
  const [error, setError] = useState(null);

  const activeRequestRef = useRef(null);
  const requestIdRef = useRef(0);

  // Cleanup in-flight requests on unmount
  useEffect(() => {
    return () => {
      if (activeRequestRef.current) {
        activeRequestRef.current.abort();
      }
    };
  }, []);

  // Fetch nearby places for a given coordinate + category using Overpass API
  const fetchNearbyPlaces = async (lat, lon, category) => {
    // Cancel any previous pending request
    if (activeRequestRef.current) {
      activeRequestRef.current.abort();
    }

    const controller = new AbortController();
    activeRequestRef.current = controller;
    const currentRequestId = ++requestIdRef.current;

    setLoading(true);
    setError(null);
    setSelectedPlace(null);

    // Set 15 second fetch timeout
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 15000);

    const query = `
[out:json][timeout:25];
(
  node["${category.key}"="${category.value}"](around:12000,${lat},${lon});
  way["${category.key}"="${category.value}"](around:12000,${lat},${lon});
  relation["${category.key}"="${category.value}"](around:12000,${lat},${lon});
);
out center 60;
`;

    try {
      const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Check HTTP status code before parsing JSON
      if (!response.ok) {
        throw new Error(`Overpass API unavailable: ${response.status}`);
      }

      const data = await response.json();

      // Discard stale API responses
      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      const parsed = (data.elements || [])
        .map((el) => {
          const placeLat = el.lat || el.center?.lat;
          const placeLon = el.lon || el.center?.lon;
          if (!placeLat || !placeLon) return null;

          const tags = el.tags || {};
          const addressParts = [
            tags["addr:housenumber"],
            tags["addr:street"],
            tags["addr:suburb"] || tags["addr:city"],
          ].filter(Boolean);

          return {
            id: `${el.type}-${el.id}`,
            name: tags.name || `Unnamed ${category.label.replace(/s$/, "")}`,
            lat: placeLat,
            lon: placeLon,
            address: addressParts.length
              ? addressParts.join(", ")
              : "Address not available",
          };
        })
        .filter(Boolean)
        .slice(0, 60);

      setPlaces(parsed);
      setError(null);
    } catch (err) {
      clearTimeout(timeoutId);

      // If aborted because of a newer request, ignore error
      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      console.error("Explore Nearby: failed to fetch places", err);
      setPlaces([]);
      if (err.name === "AbortError") {
        setError("timeout");
      } else {
        setError("unavailable");
      }
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
        activeRequestRef.current = null;
      }
    }
  };

  // Search a city / district / state / country via Nominatim geocoding
  const handleSearch = async () => {
    const query = searchInput.trim();
    if (!query) return;

    if (loading) return; // Prevent duplicate requests while loading

    setLoading(true);
    setHasSearched(true);
    setPlaces([]);
    setSelectedPlace(null);
    setError(null);

    const controller = new AbortController();
    if (activeRequestRef.current) {
      activeRequestRef.current.abort();
    }
    activeRequestRef.current = controller;

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 15000);

    try {
      const geoResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=1`,
        { signal: controller.signal }
      );

      clearTimeout(timeoutId);

      if (!geoResponse.ok) {
        throw new Error(`Nominatim unavailable: ${geoResponse.status}`);
      }

      const geoData = await geoResponse.json();

      if (!geoData || geoData.length === 0) {
        setPosition(null);
        setLocationLabel(query);
        setPlaces([]);
        setLoading(false);
        return;
      }

      const lat = parseFloat(geoData[0].lat);
      const lon = parseFloat(geoData[0].lon);

      setPosition([lat, lon]);
      setLocationLabel(geoData[0].display_name || query);

      await fetchNearbyPlaces(lat, lon, selectedCategory);
    } catch (err) {
      clearTimeout(timeoutId);
      console.error("Explore Nearby: geocoding failed", err);
      setPlaces([]);
      setLoading(false);
      setError(err.name === "AbortError" ? "timeout" : "unavailable");
    }
  };

  // Use browser geolocation
  const handleUseMyLocation = () => {
    if (loading) return; // Prevent duplicate requests

    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        setSearchInput("");
        setHasSearched(true);
        setPosition([lat, lon]);
        setLocationLabel("Your Current Location");

        await fetchNearbyPlaces(lat, lon, selectedCategory);
      },
      () => {
        setLoading(false);
        alert("Unable to access your location. Please allow location access and try again.");
      }
    );
  };

  // Switching category re-queries places at the same coordinates
  const handleCategorySelect = (category) => {
    if (loading) return; // Prevent duplicate requests
    setSelectedCategory(category);
    if (position) {
      fetchNearbyPlaces(position[0], position[1], category);
    }
  };

  // Retry previous request
  const handleRetry = () => {
    if (position) {
      fetchNearbyPlaces(position[0], position[1], selectedCategory);
    } else if (searchInput.trim()) {
      handleSearch();
    }
  };

  return (
    <div className="maps-page-root">
      <main className="maps-wrapper">
        <MapSearch
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          onSearch={handleSearch}
          onUseLocation={handleUseMyLocation}
          disabled={loading}
        />

        <CategoryFilter
          categories={EXPLORE_CATEGORIES}
          selectedCategory={selectedCategory}
          onSelect={handleCategorySelect}
          disabled={loading}
        />

        <div className="explore-body">
          <ExploreSidebar
            loading={loading}
            hasSearched={hasSearched}
            places={places}
            selectedCategory={selectedCategory}
            locationLabel={locationLabel}
            selectedPlace={selectedPlace}
            setSelectedPlace={setSelectedPlace}
            error={error}
            onRetry={handleRetry}
          />

          <ExploreMap
            position={position}
            places={places}
            selectedCategory={selectedCategory}
            selectedPlace={selectedPlace}
            setSelectedPlace={setSelectedPlace}
            loading={loading}
            hasSearched={hasSearched}
            locationLabel={locationLabel}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Maps;