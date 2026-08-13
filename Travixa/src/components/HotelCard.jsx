import React from "react";
import "../styles/HotelCard.css";

const FALLBACK_HOTEL_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='500' viewBox='0 0 800 500'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%230f172a'/%3E%3Cstop offset='50%25' stop-color='%231e293b'/%3E%3Cstop offset='100%25' stop-color='%230f172a'/%3E%3C/linearGradient%3E%3ClinearGradient id='accent' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%230284c7'/%3E%3Cstop offset='100%25' stop-color='%2306b6d4'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='800' height='500' fill='url(%23bg)'/%3E%3Ccircle cx='400' cy='210' r='60' fill='rgba(2,132,199,0.15)' stroke='url(%23accent)' stroke-width='2'/%3E%3Cg transform='translate(400,225)' text-anchor='middle'%3E%3Ctext y='0' font-size='56' fill='%2338bdf8'%3E%F0%9F%8F%A8%3C/text%3E%3Ctext y='55' font-size='20' font-family='system-ui, -apple-system, sans-serif' font-weight='600' fill='%23f8fafc' letter-spacing='1'%3EHotel image unavailable%3C/text%3E%3C/g%3E%3C/svg%3E";

const AMENITY_MAP = {
  WiFi: "📶 Free WiFi",
  Pool: "🏊 Pool",
  Breakfast: "🍽️ Breakfast",
  Parking: "🚗 Parking",
};

function HotelCard({
  name,
  location,
  rating = "4.5",
  userRatingsTotal,
  price,
  amenities = [],
  photoUrl,
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

  const hotelImage = photoUrl || FALLBACK_HOTEL_IMAGE;
  const displayPrice =
    typeof price === "number"
      ? `₹${new Intl.NumberFormat("en-IN").format(price)}`
      : price || "Check Price";

  return (
    <div className="hotel-card-redesign">
      {/* Large Hotel Image Cover */}
      <div className="hotel-image-wrap">
        <img
          src={hotelImage}
          alt={name}
          className="hotel-cover-image"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = FALLBACK_HOTEL_IMAGE;
          }}
        />
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
          {amenities?.map((amenity) => (
            <span className="amenity-chip" key={amenity}>
              {AMENITY_MAP[amenity] || amenity}
            </span>
          ))}
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