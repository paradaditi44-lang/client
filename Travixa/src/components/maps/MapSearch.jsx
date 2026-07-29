import "../../styles/MapSearch.css";

function MapSearch({
  searchInput,
  setSearchInput,
  onSearch,
  setUserLocation,
}) {
    const getCurrentLocation = () => {

  if (!navigator.geolocation) {
    alert("Geolocation is not supported.");
    return;
  }

  navigator.geolocation.getCurrentPosition(

    (position) => {

      setUserLocation([
        position.coords.latitude,
        position.coords.longitude,
      ]);

    },

    () => {
      alert("Unable to get your location.");
    }

  );

};
  return (
    <div className="map-search-container">

      <div className="map-hero">
        <span className="hero-badge">
          🌍 EXPLORE THE WORLD
        </span>

        <h1>Discover Amazing Places</h1>

        <p>
          Search destinations, attractions, restaurants,
          parks and much more around you.
        </p>
      </div>

      <div className="search-box">

        <span className="search-icon">
          🔍
        </span>

        <input
          type="text"
          placeholder="Search places, cities or attractions..."
         value={searchInput}

onChange={(e)=>

setSearchInput(e.target.value)

}
        />

<button
onClick={onSearch}
>
onKeyDown={(e)=>{

if(e.key==="Enter"){

onSearch();

}

}}
Search

</button>
<button
  className="location-btn"
  onClick={getCurrentLocation}
>
  📍 Use My Location
</button>

      </div>

    </div>
  );
}

export default MapSearch;