import "../../styles/MapSearch.css";

function MapSearch({ searchInput, setSearchInput, onSearch, onUseLocation, disabled }) {
  return (
    <div className="map-search-container">
      <div className="map-hero">
        <span className="hero-badge">🧭 EXPLORE NEARBY</span>

        <h1>Discover What's Around You</h1>

        <p>
          Search any city, district, state, or country and explore nearby
          attractions, restaurants, hotels, and more on the map.
        </p>
      </div>

      <div className="search-box">
        <span className="search-icon">🔍</span>

        <input
          type="text"
          placeholder="Search places, cities, districts, states or countries..."
          value={searchInput}
          disabled={disabled}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !disabled) {
              onSearch();
            }
          }}
        />

        <button type="button" onClick={onSearch} disabled={disabled}>
          Search
        </button>

        <button type="button" className="location-btn" onClick={onUseLocation} disabled={disabled}>
          📍 Use My Location
        </button>
      </div>
    </div>
  );
}

export default MapSearch;