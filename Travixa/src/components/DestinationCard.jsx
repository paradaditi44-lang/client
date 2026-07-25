
import "../styles/DestinationCard.css";

const destinations = [
  {
    id: 1,
    country: "Japan",
    city: "Tokyo",
    image:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800",
    season: "March - April",
  },
  {
    id: 2,
    country: "France",
    city: "Paris",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800",
    season: "April - June",
  },
  {
    id: 3,
    country: "Switzerland",
    city: "Zurich",
    image:
      "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=800",
    season: "May - September",
  },
  {
    id: 4,
    country: "Maldives",
    city: "Male",
    image:
      "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800",
    season: "November - April",
  },
];

function DestinationCard() {
  return (
    <section className="destination-section">
      <h2>🌍 Popular Destinations</h2>

      <div className="destination-grid">
        {destinations.map((place) => (
          <div className="destination-card" key={place.id}>
            <img
              src={place.image}
              alt={place.country}
              className="destination-image"
            />

            <div className="destination-content">
              <h3>{place.country}</h3>

              <p>📍 {place.city}</p>

              <p>🗓 Best Season: {place.season}</p>

              <button>Explore</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default DestinationCard;