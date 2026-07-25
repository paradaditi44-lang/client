import "../styles/Maps.css";

function Maps() {
  const nearbyHotels = [
    "🏨 Grand Hyatt",
    "🏨 Hilton Hotel",
    "🏨 Ocean Paradise",
    "🏨 City View Hotel",
  ];

  const restaurants = [
    "🍽 Sakura Restaurant",
    "🍽 Italian Bistro",
    "🍽 BBQ House",
    "🍽 Sea Food Cafe",
  ];

  const attractions = [
    "🏛 Tokyo Tower",
    "🏯 Imperial Palace",
    "🌸 Shinjuku Garden",
    "🎡 Disneyland",
  ];

  return (
    <div className="maps-page">
      <h1>🗺 Explore Nearby Places</h1>
      <p className="subtitle">
        Discover hotels, restaurants, and attractions around your destination.
      </p>

      {/* Map Placeholder */}
      <div className="map-placeholder">
        <div className="map-content">
          <h2>📍 Google Map</h2>
          <p>Google Maps will appear here after API integration.</p>
        </div>
      </div>

      <div className="places-grid">
        <div className="place-card">
          <h2>🏨 Nearby Hotels</h2>

          {nearbyHotels.map((hotel, index) => (
            <p key={index}>{hotel}</p>
          ))}
        </div>

        <div className="place-card">
          <h2>🍽 Nearby Restaurants</h2>

          {restaurants.map((restaurant, index) => (
            <p key={index}>{restaurant}</p>
          ))}
        </div>

        <div className="place-card">
          <h2>🏛 Tourist Attractions</h2>

          {attractions.map((place, index) => (
            <p key={index}>{place}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Maps;