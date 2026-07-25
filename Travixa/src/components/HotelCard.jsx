import "../styles/HotelCard.css";

function HotelCard({ image, name, location, rating, price }) {
  return (
    <div className="hotel-card">
      <img src={image} alt={name} />

      <div className="hotel-info">
        <h3>{name}</h3>

        <p>📍 {location}</p>

        <p>⭐ {rating} / 5</p>

        <p className="price">{price} / night</p>

        <div className="amenities">
          <span>📶 Wi-Fi</span>
          <span>🍽 Breakfast</span>
          <span>🏊 Pool</span>
        </div>

        <button>Book Now</button>
      </div>
    </div>
  );
}

export default HotelCard;