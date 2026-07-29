import MapView from "./MapView";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AITripResult.css";

function AITripResult() {
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [currentLocation, setCurrentLocation] = useState("");
const [locationError, setLocationError] = useState("");
const [distance, setDistance] = useState("");
const [duration, setDuration] = useState("");
const [travelMode, setTravelMode] = useState("driving");
const [loading, setLoading] = useState(false);
  useEffect(() => {
    const savedTrip = localStorage.getItem("travexaTrip");

    if (savedTrip) {
      setTrip(JSON.parse(savedTrip));
    }
    if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );

        const data = await response.json();

        const location =
          data.address.city ||
          data.address.town ||
          data.address.village ||
          data.address.state ||
          "Current Location";

        setCurrentLocation(location);
      } catch (err) {
        setLocationError("Unable to detect location.");
      }
    },
    () => {
      setLocationError(
        "Location permission denied."
      );
    }
  );
}
  }, []);

  if (!trip) {
    return (
      <div className="result-empty">

        <h2>No trip found ✈️</h2>

        <p>
          Please create your trip first.
        </p>

        <button onClick={() => navigate("/plan-trip")}>
          Plan a Trip
        </button>

      </div>
    );
  }

  const itinerary = [
    {
      day: 1,
      title: "Arrival & Local Exploration",
      icon: "✈️",
      activities: [
        "Arrive at your destination",
        "Check in to your hotel",
        "Explore nearby attractions",
        "Enjoy a local dinner",
      ],
    },
    {
      day: 2,
      title: "Explore the Highlights",
      icon: "📸",
      activities: [
        "Visit the most popular attraction",
        "Explore local streets",
        "Try traditional food",
        "Enjoy an evening experience",
      ],
    },
    {
      day: 3,
      title: "Adventure & Experiences",
      icon: "🏔️",
      activities: [
        "Start your adventure activity",
        "Visit a scenic location",
        "Take photos and explore",
        "Relax in the evening",
      ],
    },
    {
      day: 4,
      title: "Culture & Local Life",
      icon: "🏛️",
      activities: [
        "Visit a cultural attraction",
        "Explore local markets",
        "Try traditional cuisine",
        "Enjoy the local atmosphere",
      ],
    },
    {
      day: 5,
      title: "Relax & Departure",
      icon: "🌅",
      activities: [
        "Enjoy a relaxed morning",
        "Buy souvenirs",
        "Check out from the hotel",
        "Begin your journey back home",
      ],
    },
  ];

  const days = itinerary.slice(0, Number(trip.days));

  return (
    <div className="trip-result-page">

      {/* HEADER */}

      <section className="result-hero">

        <div>

          <span className="ai-badge">
            ✨ YOUR AI TRIP PLAN
          </span>

          <h1>
            Your {trip.destination} Adventure
          </h1>

          <p>
            A personalised travel plan created
            according to your preferences.
          </p>

        </div>

      </section>


      {/* TRIP SUMMARY */}
<div>
  <span>📍 STARTING POINT</span>

  <strong>
    {currentLocation || "Detecting..."}
  </strong>
</div>
      <main className="result-container">

        <div className="trip-summary">

          <div>
            <span>📍 DESTINATION</span>
            <strong>{trip.destination}</strong>
          </div>

          <div>
            <span>📅 DATE</span>
            <strong>{trip.travelDate}</strong>
          </div>

          <div>
            <span>🗓️ DURATION</span>
            <strong>{trip.days} Days</strong>
          </div>

          <div>
            <span>👥 TRAVELLERS</span>
            <strong>{trip.travellers} People</strong>
          </div>

          <div>
            <span>💰 BUDGET</span>
            <strong>{trip.budget}</strong>
          </div>

          <div>
            <span>🎒 STYLE</span>
            <strong>{trip.travelStyle}</strong>
          </div>

        </div>


        {/* ITINERARY */}

        <div className="itinerary-header">

          <div>
            <span>YOUR JOURNEY</span>

            <h2>
              {trip.days}-Day Itinerary
            </h2>
          </div>

          <button
            onClick={() => navigate("/plan-trip")}
          >
            ← Edit Trip
          </button>

        </div>


        <div className="timeline">

          {days.map((day) => (

            <div
              className="day-card"
              key={day.day}
            >

              <div className="day-number">
                <span>DAY</span>
                <strong>{day.day}</strong>
              </div>

              <div className="day-content">

                <div className="day-title">

                  <span>
                    {day.icon}
                  </span>

                  <h3>
                    {day.title}
                  </h3>

                </div>

                <div className="activities">

                  {day.activities.map(
                    (activity, index) => (

                      <div
                        className="activity"
                        key={index}
                      >

                        <span className="activity-dot">
                          ✓
                        </span>

                        <span>
                          {activity}
                        </span>

                      </div>

                    )
                  )}

                </div>

              </div>

            </div>

          ))}

        </div>
<section className="map-result-section">

  <div className="section-title">
    <h2>🗺 Route Planner</h2>
    <p>
      View the route, estimated distance and travel time.
    </p>
  </div>

  <MapView
    from="Pune"
    to={trip.destination}
    setLoading={setLoading}
    distance={distance}
    setDistance={setDistance}
    duration={duration}
    setDuration={setDuration}
    travelMode={travelMode}
    setTravelMode={setTravelMode}
  />

</section>

        {/* BOTTOM */}

        <div className="result-actions">

          <button
            className="secondary-btn"
            onClick={() => navigate("/plan-trip")}
          >
            🔄 Plan Another Trip
          </button>

          <button
            className="primary-btn"
            onClick={() => window.print()}
          >
            🖨️ Save / Print Trip
          </button>

        </div>

      </main>

    </div>
  );
}

export default AITripResult;