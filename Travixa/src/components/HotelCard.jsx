import React from "react";
import "../styles/HotelCard.css";

const HOTEL_IMAGES = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
  "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800",
];

function getHotelImage(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % HOTEL_IMAGES.length;
  return HOTEL_IMAGES[idx];
}

function getPriceEstimate(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const priceVal = 2500 + (Math.abs(hash) % 75) * 100;
  return `₹${new Intl.NumberFormat("en-IN").format(priceVal)}`;
}

function HotelCard({
  name,
  location,
  rating = "4.5",
  userRatingsTotal,
  price = "Check Price",
  website,
  mapsUrl,
}) {
  const googleMapsSearchUrl =
    mapsUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      name + " " + location
    )}`;

  const googleHotelSearchUrl =
    website ||
    `https://www.google.com/search?q=${encodeURIComponent(
      name + " " + location + " official website"
    )}`;

  const hotelImage = getHotelImage(name);
  const displayPrice = price === "Check Price" ? getPriceEstimate(name) : price;

  return (
    <div className="hotel-card-redesign">
      {/* Large Hotel Image Cover */}
      <div className="hotel-image-wrap">
        <img src={hotelImage} alt={name} className="hotel-cover-image" />
        <div className="hotel-badges-overlay">
          <span className="hotel-rating-badge">
            ⭐ {rating} {userRatingsTotal ? `(${userRatingsTotal})` : ""}
          </span>
          <span className="hotel-price-badge">
            💰 {displayPrice} <span className="per-night">/ night</span>
          </span>
        </div>
      </div>

      {/* Hotel Card Body */}
      <div className="hotel-card-body">
        <h3 className="hotel-title" title={name}>
          {name}
        </h3>

        <p className="hotel-location-text">
          <span className="loc-pin">📍</span>
          <span className="addr-text">{location}</span>
        </p>

        {/* Amenities Chips */}
        <div className="amenities-chips">
          <span className="amenity-chip">📶 Free WiFi</span>
          <span className="amenity-chip">🏊 Pool</span>
          <span className="amenity-chip">🍽️ Breakfast</span>
          <span className="amenity-chip">🚗 Parking</span>
        </div>

        {/* Action Buttons */}
        <div className="hotel-card-actions">
          <a
            href={googleHotelSearchUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-book-now"
          >
            Book Now →
          </a>

          <a
            href={googleMapsSearchUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-view-map"
            title="View on Google Maps"
          >
            📍 Map
          </a>
        </div>
      </div>
    </div>
  );
}

export default HotelCard;