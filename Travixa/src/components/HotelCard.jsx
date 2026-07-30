import React from "react";
import "../styles/HotelCard.css";

// Deterministic gradient accent picker so cards feel varied and premium
// without using any external images, stock photos, or placeholders.
const ACCENTS = [
  { grad: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", glow: "rgba(118,75,162,0.35)" },
  { grad: "linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)", glow: "rgba(6,182,212,0.35)" },
  { grad: "linear-gradient(135deg, #f97316 0%, #db2777 100%)", glow: "rgba(219,39,119,0.35)" },
  { grad: "linear-gradient(135deg, #059669 0%, #2563eb 100%)", glow: "rgba(5,150,105,0.35)" },
  { grad: "linear-gradient(135deg, #7c3aed 0%, #db2777 100%)", glow: "rgba(124,58,237,0.35)" },
  { grad: "linear-gradient(135deg, #0ea5e9 0%, #22c55e 100%)", glow: "rgba(14,165,233,0.35)" },
];

function pickAccent(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return ACCENTS[Math.abs(hash) % ACCENTS.length];
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
  const accent = pickAccent(name || "hotel");

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

  return (
    <div className="hotel-card">
      {/* Premium image-free header */}
      <div
        className="hotel-header-visual"
        style={{ background: accent.grad, "--accent-glow": accent.glow }}
      >
        <div className="hotel-header-pattern" />

        <span className="rating-badge">
          ⭐ {rating}
          {userRatingsTotal ? ` (${userRatingsTotal})` : ""}
        </span>

        <div className="hotel-icon-wrap">
          <span className="hotel-icon" role="img" aria-label="Hotel">
            🏨
          </span>
        </div>

        <h3 className="hotel-name-header" title={name}>
          {name}
        </h3>

        <p className="hotel-address-header">
          <span className="loc-icon">📍</span>
          <span className="addr-text">{location}</span>
        </p>

        <span className="photos-google-badge">
          📷 Photos available on Google
        </span>
      </div>

      {/* Hotel Information Details */}
      <div className="hotel-info">
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
          <a
            href={googleHotelSearchUrl}
            target="_blank"
            rel="noreferrer"
            className="book-btn"
          >
            🔍 View Hotel
          </a>

          <a
            href={googleMapsSearchUrl}
            target="_blank"
            rel="noreferrer"
            className="map-btn"
          >
            📍 View on Google Maps
          </a>
        </div>
      </div>
    </div>
  );
}

export default HotelCard;