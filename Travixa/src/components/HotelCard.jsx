import "../styles/HotelCard.css";

function HotelCard({
  image,
  name,
  location,
  rating,
  price,
}) {
  const hotelImage =
    image ||
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800";

  return (
    <div className="hotel-card">
      <div className="hotel-preview">
  <h1>🏨</h1>
  <p>Hotel Information Available</p>

  <span className="rating-badge">
    ⭐ {rating}
  </span>
</div>

      <div className="hotel-info">
        <h3>{name}</h3>

        <p className="location">
          📍 {location}
        </p>

        <p className="price">
          {price}
          {price !== "Check Price" && <span> / night</span>}
        </p>

        <div className="amenities">
          <span>📶 Free WiFi</span>
          <span>🍽 Breakfast</span>
          <span>🏊 Pool</span>
          <span>🚗 Parking</span>
        </div>

        <div className="hotel-buttons">
          <button
            className="details-btn"
            onClick={() =>
              alert(
                `🏨 ${name}

📍 ${location}

⭐ Rating: ${rating}

💰 ${price}`
              )
            }
          >
            View Details
          </button>

          <a
            href={`https://www.google.com/search?q=${encodeURIComponent(
  name + " " + location
)}`}
            target="_blank"
            rel="noreferrer"
            className="book-btn"
          >
            🔍 View Hotel
          </a>
        </div>

        <a
          href={`https://www.google.com/maps/search/${encodeURIComponent(
            name + " " + location
          )}`}
          target="_blank"
          rel="noreferrer"
          className="map-link"
        >
          📍 View on Google Maps
        </a>
      </div>
    </div>
  );
}

export default HotelCard;