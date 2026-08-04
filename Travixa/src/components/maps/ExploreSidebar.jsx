import "../../styles/ExploreSidebar.css";

function ExploreSidebar({
  loading,
  hasSearched,
  places,
  selectedCategory,
  locationLabel,
  selectedPlace,
  setSelectedPlace,
  error,
  onRetry,
}) {
  return (
    <aside className="explore-sidebar">
      {/* Stats header */}
      <div className="sidebar-stats">
        <div className="stat-block">
          <span className="stat-number">{loading ? "…" : places.length}</span>
          <span className="stat-caption">Places Found</span>
        </div>

        <div className="stat-block">
          <span className="stat-number stat-icon-value">
            {selectedCategory.icon}
          </span>
          <span className="stat-caption" title={selectedCategory.label}>
            {selectedCategory.label}
          </span>
        </div>

        <div className="stat-block stat-block-wide">
          <span className="stat-number stat-text-value" title={locationLabel}>
            {locationLabel || "—"}
          </span>
          <span className="stat-caption">Selected Location</span>
        </div>
      </div>

      {/* Selected place detail card */}
      {selectedPlace && (
        <div className="place-detail-card">
          <button
            type="button"
            className="place-detail-close"
            onClick={() => setSelectedPlace(null)}
            aria-label="Close details"
          >
            ×
          </button>

          <span
            className="place-detail-icon"
            style={{ background: selectedCategory.color }}
          >
            {selectedCategory.icon}
          </span>

          <h3>{selectedPlace.name}</h3>

          <p className="place-detail-category">
            {selectedCategory.icon} {selectedCategory.label}
          </p>

          <p className="place-detail-address">
            📍 {selectedPlace.address}
          </p>

          <a
            href={`https://www.google.com/maps/search/?api=1&query=${selectedPlace.lat},${selectedPlace.lon}`}
            target="_blank"
            rel="noreferrer"
            className="place-detail-btn"
          >
            Open in Google Maps
          </a>
        </div>
      )}

      {/* Place list */}
      <div className="sidebar-list">
        {loading && (
          <div className="sidebar-status">
            <span className="sidebar-spinner" />
            <p>Searching nearby places...</p>
          </div>
        )}

        {!loading && error && (
          <div className="sidebar-status">
            <span className="sidebar-status-icon">⚠️</span>
            <h4>Unable to fetch nearby places.</h4>
            <p>
              {error === "timeout"
                ? "Request timed out. Please try again."
                : "The map service is temporarily busy. Please try again in a few seconds."}
            </p>
            {onRetry && (
              <button
                type="button"
                className="sidebar-retry-btn"
                onClick={onRetry}
              >
                🔄 Retry
              </button>
            )}
          </div>
        )}

        {!loading && !error && hasSearched && places.length === 0 && (
          <div className="sidebar-status">
            <span className="sidebar-status-icon">{selectedCategory.icon}</span>
            <h4>No {selectedCategory.label} found near this location.</h4>
            <p>Try another category or search a nearby city.</p>
          </div>
        )}

        {!loading && !error && !hasSearched && (
          <div className="sidebar-status">
            <span className="sidebar-status-icon">🗺️</span>
            <h4>Nothing to show yet</h4>
            <p>Search a city, district, state, or country above.</p>
          </div>
        )}

        {!loading &&
          !error &&
          places.map((place) => {
            const isSelected = selectedPlace?.id === place.id;

            return (
              <button
                type="button"
                key={place.id}
                className={`place-list-item ${isSelected ? "active" : ""}`}
                onClick={() => setSelectedPlace(place)}
              >
                <span
                  className="place-list-icon"
                  style={{ background: selectedCategory.color }}
                >
                  {selectedCategory.icon}
                </span>

                <span className="place-list-text">
                  <span className="place-list-name">{place.name}</span>
                  <span className="place-list-address">{place.address}</span>
                </span>
              </button>
            );
          })}
      </div>
    </aside>
  );
}

export default ExploreSidebar;