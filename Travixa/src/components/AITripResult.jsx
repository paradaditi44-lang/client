import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { generateItineraryPDF } from "../utils/generatePDF";
import PackingChecklist from "./PackingChecklist";
import DestinationVideos from "./DestinationVideos/DestinationVideos";
import DestinationGallery from "./DestinationGallery/DestinationGallery";
import "../styles/AITripResult.css";

function AITripResult({ trip: propTrip }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [trip, setTrip] = useState(propTrip || location?.state?.trip || null);
  const [currentLocation, setCurrentLocation] = useState("");
  const [locationError, setLocationError] = useState("");
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [travelMode, setTravelMode] = useState("driving");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (propTrip) {
      setTrip(propTrip);
    } else if (location?.state?.trip) {
      setTrip(location.state.trip);
    } else {
      const savedTrip = localStorage.getItem("travexaTrip");
      if (savedTrip) {
        try {
          setTrip(JSON.parse(savedTrip));
        } catch (e) {
          console.error(e);
        }
      }
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

            const loc =
              data.address.city ||
              data.address.town ||
              data.address.village ||
              data.address.state ||
              "Current Location";

            setCurrentLocation(loc);
          } catch (err) {
            setLocationError("Unable to detect location.");
          }
        },
        () => {
          setLocationError("Location permission denied.");
        }
      );
    }
  }, [propTrip, location]);

  if (!trip) {
    return (
      <div className="result-empty">

        <div className="loading-card">
          <h2>🏨 No Trip Found</h2>

          <p>
            Please plan your trip to generate an itinerary.
          </p>
        </div>

        <p>
          Please create your trip first.
        </p>

        <button onClick={() => navigate("/plan-trip")}>
          Plan a Trip
        </button>

      </div>
    );
  }

  // Parse or format backend itinerary string into day objects
  const parseItinerary = (itineraryText) => {
    if (!itineraryText) return [];

    if (Array.isArray(itineraryText)) return itineraryText;

    if (typeof itineraryText === "string") {
      const dayIcons = ["✈️", "📸", "🏔️", "🏛️", "🌅", "🎒", "🚗", "🌟"];
      const dayRegex = /(?:Day\s+\d+|###\s*Day\s+\d+|\*\*Day\s+\d+\*\*)/i;

      if (dayRegex.test(itineraryText)) {
        const parts = itineraryText
          .split(/(?=(?:Day\s+\d+|###\s*Day\s+\d+|\*\*Day\s+\d+\*\*))/i)
          .filter(Boolean);

        return parts.map((part, index) => {
          const lines = part
            .trim()
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean);

          let titleLine = lines[0] ? lines[0].replace(/^#+\s*/, "").replace(/\*\*/g, "") : `Day ${index + 1}`;
          const activities = lines
            .slice(1)
            .map((l) => l.replace(/^[-*•\d.]+\s*/, "").replace(/\*\*/g, ""))
            .filter(Boolean);

          return {
            day: index + 1,
            title: titleLine.replace(/^Day\s+\d+[:\s-]*/i, "") || "Day Overview",
            icon: dayIcons[index % dayIcons.length],
            activities: activities.length > 0 ? activities : [part],
          };
        });
      } else {
        const lines = itineraryText
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);

        return [
          {
            day: 1,
            title: "AI Generated Itinerary",
            icon: "✨",
            activities: lines.map((l) => l.replace(/^[-*•\d.]+\s*/, "").replace(/\*\*/g, "")),
          },
        ];
      }
    }

    return [];
  };

  const defaultItinerary = [
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
  ];

  const days = trip.itinerary
    ? parseItinerary(trip.itinerary)
    : defaultItinerary;

  const calculateDays = () => {
    if (trip.days) return trip.days;
    if (trip.startDate && trip.endDate) {
      const start = new Date(trip.startDate);
      const end = new Date(trip.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays || 1;
    }
    return days.length || 5;
  };

  const displayDays = calculateDays();
  const displayTravelers = trip.numberOfTravelers || trip.travellers || trip.travelers || 1;
  const displayBudget = typeof trip.budget === "number" ? `₹${trip.budget.toLocaleString()}` : (trip.budget || "N/A");
  const displayStyle = trip.preferences?.travelStyle || trip.travelStyle || "General";
  const displayDate = trip.startDate || trip.travelDate || "N/A";

  return (
    <div className="trip-result-page">

      {/* TRIP SUMMARY */}
      <div className="starting-point">
        <span>📍 STARTING POINT</span>

        <strong>
          {locationError
            ? locationError
            : currentLocation || "Detecting..."}
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
            <strong>{displayDate}</strong>
          </div>

          <div>
            <span>🗓️ DURATION</span>
            <strong>{displayDays} Days</strong>
          </div>

          <div>
            <span>👥 TRAVELLERS</span>
            <strong>{displayTravelers} People</strong>
          </div>

          <div>
            <span>💰 BUDGET</span>
            <strong>{displayBudget}</strong>
          </div>

          <div>
            <span>🎒 STYLE</span>
            <strong>{displayStyle}</strong>
          </div>

        </div>


        {/* ITINERARY */}

        <div className="itinerary-header">

          <div>
            <span>YOUR JOURNEY</span>

            <h2>
              {displayDays}-Day Itinerary
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
                    {day.icon || "📍"}
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

        {/* DESTINATION TRAVEL VIDEOS */}
        <DestinationVideos destination={trip.destination} />

        {/* AI DESTINATION TRAVEL GALLERY */}
        <DestinationGallery destination={trip.destination} />

        {/* AI PACKING CHECKLIST */}
        <PackingChecklist
          destination={trip.destination}
          travelStyle={displayStyle}
          duration={displayDays}
        />

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
            onClick={() => generateItineraryPDF(trip, days, displayDays)}
          >
            📄 Download Itinerary PDF
          </button>

        </div>

      </main>

    </div>
  );
}

export default AITripResult;