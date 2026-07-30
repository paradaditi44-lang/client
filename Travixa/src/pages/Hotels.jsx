import { useState } from "react";
import HotelCard from "../components/HotelCard";
import "../styles/Hotels.css";

function Hotels() {
  const [search, setSearch] = useState("");
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_KEY = "21be2c66503444a1a04fc355b92e97e5";

  const hotelImages = [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
    "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
  ];

  const searchHotels = async () => {
    if (!search.trim()) return;

    setLoading(true);

    try {
      const geoResponse = await fetch(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
          search
        )}&apiKey=${API_KEY}`
      );

      const geoData = await geoResponse.json();
console.log("Geo Data:", geoData);
      if (!geoData.features || geoData.features.length === 0) {
        setHotels([]);
        setLoading(false);
        return;
      }

      const [lon, lat] = geoData.features[0].geometry.coordinates;

      const hotelResponse = await fetch(
        `https://api.geoapify.com/v2/places?categories=accommodation.hotel&filter=circle:${lon},${lat},5000&limit=20&apiKey=${API_KEY}`
      );

      const hotelData = await hotelResponse.json();
console.log("Hotel Data:", hotelData);
      setHotels(hotelData.features || []);
    } catch (error) {
      console.error("Hotel Search Error:", error);
      setHotels([]);
    }

    setLoading(false);
  };

  return (
    <div className="hotels-page">
      <div className="hotels-header">
        <h1>🏨 Find Your Perfect Stay</h1>

        <p>Search and discover hotels anywhere in the world.</p>

        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Enter city name..."
            className="hotel-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                searchHotels();
              }
            }}
          />

          <button className="search-btn" onClick={searchHotels}>
            Search
          </button>
        </div>
      </div>

      {!loading && hotels.length > 0 && (
        <h3 className="hotel-count">
          {hotels.length} Hotels Found in "{search}"
        </h3>
      )}

      <div className="hotel-grid">
        {loading && (
          <div className="loading-card">
            <h2>🔍 Searching Hotels...</h2>
            <p>Please wait while we find the best hotels.</p>
          </div>
        )}

        {!loading &&
          hotels.map((hotel, index) => (
            <HotelCard
              key={hotel.properties.place_id || index}
              image={hotelImages[index % hotelImages.length]}
              name={hotel.properties.name || "Unnamed Hotel"}
              location={
                hotel.properties.formatted || "Address unavailable"
              }
              rating="4.5"
              price="Check Price"
            />
          ))}

        {!loading && hotels.length === 0 && (
          <div className="loading-card">
            <h2>🏨 No Hotels Found</h2>

            <p>Search any city to discover hotels.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Hotels;