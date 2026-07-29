import { useState } from "react";

import MapSearch from "../components/maps/MapSearch";
import CategoryFilter from "../components/maps/CategoryFilter";
import ExploreMap from "../components/maps/ExploreMap";

import "../styles/Maps.css";

function Maps() {
const [userLocation, setUserLocation] = useState(null);
 const [searchInput, setSearchInput] = useState("");
const [places, setPlaces] = useState([]);
const [searchPlace, setSearchPlace] = useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("Attractions");

  return (

    <div className="maps-page">

     
<MapSearch
  searchInput={searchInput}
  setSearchInput={setSearchInput}
  onSearch={() => {
    if (searchInput.trim() !== "") {
      setSearchPlace(searchInput);
    }
  }}
  setUserLocation={setUserLocation}
/>

      <CategoryFilter
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      <ExploreMap
  searchPlace={searchPlace}
  selectedCategory={selectedCategory}
  userLocation={userLocation}
  places={places}
  
  setPlaces={setPlaces}
/>
    </div>

  );
}

export default Maps;