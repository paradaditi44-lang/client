import HotelCard from "../components/HotelCard";
import "../styles/Hotels.css";

function Hotels() {
  return (
    <div className="hotels-page">
      <div className="hotels-header">
        <h1>🏨 Find Your Perfect Stay</h1>
        <p>Search and book the best hotels at your destination.</p>

        <input
          type="text"
          placeholder="🔍 Search hotels by city..."
          className="hotel-search"
        />
      </div>

      <div className="hotel-grid">
        <HotelCard
          image="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"
          name="Grand Hyatt"
          location="Tokyo, Japan"
          rating="4.8"
          price="₹12,500"
        />

        <HotelCard
          image="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"
          name="Hilton Paris"
          location="Paris, France"
          rating="4.7"
          price="₹15,000"
        />

        <HotelCard
          image="https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800"
          name="Swiss Alpine Resort"
          location="Zurich, Switzerland"
          rating="4.9"
          price="₹18,000"
        />

        <HotelCard
          image="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800"
          name="Ocean Paradise"
          location="Maldives"
          rating="4.9"
          price="₹22,000"
        />
      </div>
    </div>
  );
}

export default Hotels;