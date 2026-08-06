import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { generateItineraryPDF } from "../utils/generatePDF";
import PackingChecklist from "./PackingChecklist";
import DestinationVideos from "./DestinationVideos/DestinationVideos";

import "../styles/AITripResult.css";

function AITripResult({ trip: propTrip, showExtras = true, showSummary = true }) {
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

  // Parse or format backend itinerary string into day objects with exact day count enforcement
  const parseItinerary = (itineraryText, targetDays) => {
    if (!itineraryText) return [];

    let parsed = [];
    if (Array.isArray(itineraryText)) {
      parsed = itineraryText;
    } else if (typeof itineraryText === "string") {
      const dayIcons = ["✈️", "📸", "🏔️", "🏛️", "🌅", "🎒", "🚗", "🌟"];
      const dayRegex = /(?:Day\s+\d+|###\s*Day\s+\d+|\*\*Day\s+\d+\*\*)/i;

      if (dayRegex.test(itineraryText)) {
        const parts = itineraryText
          .split(/(?=(?:Day\s+\d+|###\s*Day\s+\d+|\*\*Day\s+\d+\*\*))/i)
          .filter(Boolean);

        const extractedDays = [];
        parts.forEach((part) => {
          const trimmed = part.trim();
          if (/^(?:Day\s+\d+|###\s*Day\s+\d+|\*\*Day\s+\d+\*\*)/i.test(trimmed)) {
            extractedDays.push(trimmed);
          }
        });

        parsed = extractedDays.map((part, index) => {
          const lines = part
            .trim()
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean);

          let titleLine = lines[0] ? lines[0].replace(/^#+\s*/, "").replace(/\*\*/g, "") : `Day ${index + 1}`;
          const cleanActivityLine = (rawLine) => {
            if (!rawLine) return "";
            let line = rawLine.trim().replace(/^#+\s*/, "").replace(/\*\*/g, "");
            line = line.replace(/^[-*•]\s*/, "").replace(/^\d+\.\s+/, "");
            if (/^:\d{2}\s*(?:AM|PM)/i.test(line)) {
              line = "8" + line;
            }
            return line.trim();
          };

          const activities = lines
            .slice(1)
            .map(cleanActivityLine)
            .filter(Boolean);

          return {
            day: index + 1,
            title: titleLine.replace(/^Day\s+\d+[:\s-]*/i, "") || `Day ${index + 1} Overview`,
            icon: dayIcons[index % dayIcons.length],
            activities: activities.length > 0 ? activities : [part],
          };
        });
      } else {
        const lines = itineraryText
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);

        const cleanActivityLine = (rawLine) => {
          if (!rawLine) return "";
          let line = rawLine.trim().replace(/^#+\s*/, "").replace(/\*\*/g, "");
          line = line.replace(/^[-*•]\s*/, "").replace(/^\d+\.\s+/, "");
          if (/^:\d{2}\s*(?:AM|PM)/i.test(line)) {
            line = "8" + line;
          }
          return line.trim();
        };

        parsed = [
          {
            day: 1,
            title: "AI Generated Itinerary",
            icon: "✨",
            activities: lines.map(cleanActivityLine).filter(Boolean),
          },
        ];
      }
    }

    if (!targetDays || targetDays <= 0) return parsed;

    // Validate and enforce targetDays count strictly
    if (parsed.length > targetDays) {
      parsed = parsed.slice(0, targetDays);
    } else if (parsed.length < targetDays) {
      const dayIcons = ["✈️", "📸", "🏔️", "🏛️", "🌅", "🎒", "🚗", "🌟"];
      for (let i = parsed.length + 1; i <= targetDays; i++) {
        parsed.push({
          day: i,
          title: `Day ${i} Sightseeing & Exploration`,
          icon: dayIcons[(i - 1) % dayIcons.length],
          activities: [
            "🌅 Morning: Local breakfast and landmark visit",
            "☀ Late Morning: City center exploration & museum tour",
            "🍽 Lunch: Regional dining recommendation",
            "🌇 Afternoon: Shopping and park relaxation",
            "🌆 Evening: Sunset viewpoint",
            "🌙 Night: Local dinner & relaxation",
          ],
        });
      }
    }

    return parsed.map((d, idx) => ({ ...d, day: idx + 1 }));
  };

  const calculateDays = () => {
    if (trip.days) return trip.days;
    if (trip.startDate && trip.endDate) {
      const start = new Date(trip.startDate);
      const end = new Date(trip.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return (diffDays + 1) || 1;
    }
    return 1;
  };

  const displayDays = calculateDays();

  const days = trip.itinerary
    ? parseItinerary(trip.itinerary, displayDays)
    : parseItinerary(null, displayDays);

  const displayTravelers = trip.numberOfTravelers || trip.travellers || trip.travelers || 1;
  const displayBudget = typeof trip.budget === "number" ? `₹${trip.budget.toLocaleString()}` : (trip.budget || "N/A");
  const displayCategory = trip.preferences?.travelStyle || trip.travelStyle || "Family";
  const displayTransport = trip.preferences?.transport || "Driving";
  const displayDate = trip.startDate || trip.travelDate || "N/A";

  return (
    <div className="trip-result-page">
      {showSummary && (
        <>
          {/* TRIP SUMMARY */}
          <div className="starting-point">
            <span>📍 STARTING POINT</span>
            <strong>
              {locationError
                ? locationError
                : currentLocation || "Detecting..."}
            </strong>
          </div>

          <div className="result-container" style={{ marginTop: 0 }}>
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
                <span>🗓️ TOTAL DAYS</span>
                <strong>{displayDays} Days</strong>
              </div>

              <div>
                <span>👥 TRAVELERS</span>
                <strong>{displayCategory} ({displayTravelers} {displayTravelers === 1 ? "Person" : "People"})</strong>
              </div>

              <div>
                <span>💰 ESTIMATED COST</span>
                <strong>{displayBudget}</strong>
              </div>

              <div>
                <span>🚗 TRAVEL STYLE</span>
                <strong>{displayTransport}</strong>
              </div>

              <div>
                <span>🚶 TOTAL DISTANCE</span>
                <strong>~{displayDays * 12} km total</strong>
              </div>

              <div>
                <span>🌤️ WEATHER OVERVIEW</span>
                <strong>Pleasant seasonal climate & clear skies</strong>
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <span>🍲 BEST LOCAL FOODS</span>
                <strong>Authentic regional thali, street snacks, and traditional desserts</strong>
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <span>💡 ESSENTIAL TRAVEL TIPS</span>
                <strong style={{ fontSize: "13.5px", fontWeight: "600", lineHeight: "1.5" }}>
                  • Keep digital/physical tickets and IDs offline &nbsp;• Reserve monument passes online &nbsp;• Carry small cash bills &nbsp;• Wear comfortable walking shoes
                </strong>
              </div>
            </div>
          </div>
        </>
      )}

      <main className="result-container">
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
                  {day.activities.map((activity, index) => {
                    const isHeader =
                      /^(?:🌅|☀|🍽|🌇|🌆|🌙|Daily Summary|Trip Summary|###|\*\*)/.test(
                        activity
                      ) || /^\d+:\d+/.test(activity);

                    const isSummaryItem = /^(?:💰|🚶|🚗|🌤|🎒|🍲|- 💰|- 🚶|- 🚗|- 🌤|- 🎒|- 🍲)/.test(
                      activity
                    );

                    if (isHeader) {
                      return (
                        <div
                          key={index}
                          className="activity-section-header"
                          style={{
                            fontWeight: "800",
                            fontSize: "15px",
                            color: "var(--primary, #0284c7)",
                            marginTop: index > 0 ? "16px" : "4px",
                            marginBottom: "6px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <span>{activity}</span>
                        </div>
                      );
                    }

                    if (isSummaryItem) {
                      return (
                        <div
                          key={index}
                          className="activity-summary-item"
                          style={{
                            fontSize: "13.5px",
                            color: "var(--text)",
                            background: "var(--surface)",
                            padding: "6px 12px",
                            borderRadius: "10px",
                            margin: "4px 0",
                            fontWeight: "600",
                          }}
                        >
                          {activity}
                        </div>
                      );
                    }

                    return (
                      <div className="activity" key={index}>
                        <span className="activity-dot">✓</span>
                        <span>{activity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {showExtras && (
          <>
            {/* DESTINATION TRAVEL VIDEOS */}
            <DestinationVideos destination={trip.destination} />

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
          </>
        )}
      </main>
    </div>
  );
}

export default AITripResult;