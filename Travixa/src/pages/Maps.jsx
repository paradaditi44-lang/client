import { useState, useRef, useEffect } from "react";

import MapSearch from "../components/maps/MapSearch";
import CategoryFilter from "../components/maps/CategoryFilter";
import ExploreMap from "../components/maps/ExploreMap";
import ExploreSidebar from "../components/maps/ExploreSidebar";
import Footer from "../components/Footer";
import { EXPLORE_CATEGORIES, DEFAULT_CATEGORY } from "../utils/explorecategories";
import { geocodeLocation, isValidCoordinate } from "../services/geocoding";
import { fetchPlacesForCategory } from "../services/recommendations";

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

  // Fetch nearby places for a given coordinate + category using recommendations service
  const fetchNearbyPlaces = async (lat, lon, category) => {
    if (!isValidCoordinate(lat, lon)) {
      setPlaces([]);
      setLoading(false);
      return;
    }

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

    try {
      const results = await fetchPlacesForCategory(lat, lon, category, controller.signal);

      // Discard stale API responses
      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      setPlaces(results);
      setError(null);
    } catch (err) {
      if (currentRequestId !== requestIdRef.current) return;

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

  // Search a city / tourist attraction / state / country via multi-stage geocoding
  const handleSearch = async () => {
    const query = searchInput.trim();
    if (!query) return;

    if (loading) return; // Prevent duplicate requests while loading

    setLoading(true);
    setHasSearched(true);
    setPlaces([]);
    setSelectedPlace(null);
    setError(null);

    try {
      const geoResult = await geocodeLocation(query);

      if (!geoResult || !isValidCoordinate(geoResult.lat, geoResult.lon)) {
        setPosition(null);
        setLocationLabel(query);
        setPlaces([]);
        setLoading(false);
        setError("not_found");
        return;
      }

      const { lat, lon, displayName } = geoResult;
      setPosition([lat, lon]);
      setLocationLabel(displayName || query);

      await fetchNearbyPlaces(lat, lon, selectedCategory);
    } catch (err) {
      console.error("Explore Nearby: geocoding failed", err);
      setPlaces([]);
      setLoading(false);
      setError("unavailable");
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
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        if (!isValidCoordinate(lat, lon)) {
          setLoading(false);
          alert("Invalid GPS coordinates received.");
          return;
        }

        setSearchInput("");
        setHasSearched(true);
        setPosition([lat, lon]);
        setLocationLabel("Your Current Location");

        await fetchNearbyPlaces(lat, lon, selectedCategory);
      },
      (err) => {
        setLoading(false);
        console.warn("Geolocation permission error:", err);
        alert("Unable to access your location. Please allow location access and try again.");
      }
    );
  };

  // Switching category re-queries places at the same coordinates
  const handleCategorySelect = (category) => {
    if (loading) return; // Prevent duplicate requests
    setSelectedCategory(category);
    if (position && isValidCoordinate(position[0], position[1])) {
      fetchNearbyPlaces(position[0], position[1], category);
    }
  };

  // Retry previous request
  const handleRetry = () => {
    if (position && isValidCoordinate(position[0], position[1])) {
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