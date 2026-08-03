import { useState } from "react";

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

  // Fetch nearby places for a given coordinate + category using Overpass API
  const fetchNearbyPlaces = async (lat, lon, category) => {
    setLoading(true);
    setSelectedPlace(null);

    const query = `
[out:json][timeout:25];
(
  node["${category.key}"="${category.value}"](around:6000,${lat},${lon});
  way["${category.key}"="${category.value}"](around:6000,${lat},${lon});
  relation["${category.key}"="${category.value}"](around:6000,${lat},${lon});
);
out center 60;
`;

    try {
      const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query,
      });

      const data = await response.json();

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
    } catch (error) {
      console.error("Explore Nearby: failed to fetch places", error);
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  };

  // Search a city / district / state / country via Nominatim geocoding
  const handleSearch = async () => {
    const query = searchInput.trim();
    if (!query) return;

    setLoading(true);
    setHasSearched(true);
    setPlaces([]);
    setSelectedPlace(null);

    try {
      const geoResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=1`
      );
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
    } catch (error) {
      console.error("Explore Nearby: geocoding failed", error);
      setPlaces([]);
      setLoading(false);
    }
  };

  // Use browser geolocation
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

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
        alert("Unable to access your location. Please allow location access and try again.");
      }
    );
  };

  // Switching category re-queries places at the same coordinates
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    if (position) {
      fetchNearbyPlaces(position[0], position[1], category);
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
        />

        <CategoryFilter
          categories={EXPLORE_CATEGORIES}
          selectedCategory={selectedCategory}
          onSelect={handleCategorySelect}
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