import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { generateItineraryPDF } from "../utils/generatePDF";
import { formatTotalDistanceText, calculateItineraryDistance } from "../services/geocoding";
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
  const [calculatedDistance, setCalculatedDistance] = useState(null);

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

  // Parse or format backend itinerary into canonical day objects
  const parseItinerary = (itineraryData, targetDays) => {
    if (!itineraryData) return [];

    let itineraryObj = itineraryData;
    if (typeof itineraryData === "string") {
      try {
        const parsedJson = JSON.parse(itineraryData);
        if (parsedJson && (parsedJson.days || Array.isArray(parsedJson))) {
          itineraryObj = parsedJson;
        }
      } catch (e) {
        // Legacy markdown string
      }
    }

    if (itineraryObj && Array.isArray(itineraryObj.days)) {
      return itineraryObj.days;
    }

    if (Array.isArray(itineraryObj)) {
      return itineraryObj;
    }

    let parsed = [];
    if (typeof itineraryData === "string") {
      const dayIcons = ["✈️", "📸", "🏔️", "🏛️", "🌅", "🎒", "🚗", "🌟"];
      const dayRegex = /(?:Day\s+\d+|###\s*Day\s+\d+|\*\*Day\s+\d+\*\*)/i;

      if (dayRegex.test(itineraryData)) {
        const parts = itineraryData
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

          let rawTitleLine = lines[0] ? lines[0].replace(/^#+\s*/, "").replace(/\*\*/g, "") : `Day ${index + 1} Overview`;
          let cleanTitle = rawTitleLine
            .replace(/^(?:Day\s+\d+|###\s*Day\s+\d+|\*\*Day\s+\d+\*\*)\s*[:–-]*\s*/i, "")
            .replace(/\s*[-–]\s*Day\s+\d+\s*/gi, "")
            .trim();

          const cleanActivityLine = (rawLine) => {
            if (!rawLine || typeof rawLine !== "string") return "";
            let text = rawLine.trim();

            if (/^#+$|^[-*_]{3,}$/.test(text)) return "";
            if (/^\|[\s\-:|]+\|?$/i.test(text)) return "";
            if (/^\|\s*Time\s*\|\s*Activity\s*\|?$/i.test(text)) return "";
            if (/^\|\s*Time\s*\|\s*Location\s*\|\s*Details\s*\|?$/i.test(text)) return "";

            if (text.startsWith("|")) {
              const cells = text.split("|").map((c) => c.trim()).filter(Boolean);
              if (cells.length >= 2) {
                if (/^\d{1,2}:\d{2}\s*(?:AM|PM)?$/i.test(cells[0])) {
                  text = `${cells[0]} – ${cells.slice(1).join(" - ")}`;
                } else {
                  text = cells.join(" – ");
                }
              } else if (cells.length === 1) {
                text = cells[0];
              }
            }

            text = text.replace(/\*\*/g, "").replace(/__/g, "").replace(/`/g, "");
            text = text
              .replace(/^#+\s*/, "")
              .replace(/^[-*•]\s*/, "")
              .replace(/^\d+\.\s+/, "")
              .trim();

            if (/^:\d{2}\s*(?:AM|PM)/i.test(text)) {
              text = "8" + text;
            }

            return text;
          };

          const activities = lines
            .slice(1)
            .map(cleanActivityLine)
            .filter(Boolean);

          return {
            day: index + 1,
            title: cleanTitle || `Day ${index + 1} Overview`,
            icon: dayIcons[index % dayIcons.length],
            activities: activities.length > 0 ? activities : [part],
          };
        });
      }
    }

    if (!targetDays || targetDays <= 0) return parsed;
    if (parsed.length > targetDays) return parsed.slice(0, targetDays);

    return parsed.map((d, idx) => ({ ...d, day: idx + 1 }));
  };

  const calculateDays = () => {
    if (trip.startDate && trip.endDate) {
      const [sYear, sMonth, sDay] = String(trip.startDate).split('-').map(Number);
      const [eYear, eMonth, eDay] = String(trip.endDate).split('-').map(Number);
      if (sYear && sMonth && sDay && eYear && eMonth && eDay) {
        const startUtc = Date.UTC(sYear, sMonth - 1, sDay);
        const endUtc = Date.UTC(eYear, eMonth - 1, eDay);
        const diffMs = endUtc - startUtc;
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
        return Math.max(1, diffDays + 1);
      }
      const start = new Date(trip.startDate);
      const end = new Date(trip.endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const diffMs = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
        return Math.max(1, diffDays + 1);
      }
    }
    if (trip.days) return trip.days;
    return 1;
  };

  const displayDays = calculateDays();

  const days = trip.itinerary
    ? parseItinerary(trip.itinerary, displayDays)
    : parseItinerary(null, displayDays);

  useEffect(() => {
    if (!trip?.totalDistanceKm && days && days.length > 0 && !calculatedDistance) {
      const places = [];
      days.forEach((d) => {
        if (Array.isArray(d.activities)) {
          d.activities.forEach((act) => {
            let cleaned = act
              .replace(/^[\d:]+\s*(?:AM|PM)?\s*[-–]?\s*/i, "")
              .replace(/^(?:Visit|Explore|Tour of|Guided tour of|Sightseeing at|Stroll through|Transfer to)\s+/i, "")
              .replace(/\(.*?\)/g, "")
              .replace(/~?₹[\d,]+\/person/gi, "")
              .trim();
            if (
              cleaned &&
              cleaned.length > 3 &&
              !cleaned.toLowerCase().startsWith("breakfast") &&
              !cleaned.toLowerCase().startsWith("lunch") &&
              !cleaned.toLowerCase().startsWith("dinner") &&
              !cleaned.toLowerCase().startsWith("daily summary") &&
              !cleaned.toLowerCase().startsWith("trip summary") &&
              !cleaned.toLowerCase().startsWith("safe travels")
            ) {
              places.push(cleaned);
            }
          });
        }
      });
      if (places.length > 0) {
        calculateItineraryDistance({
          destination: trip.destination,
          places: places,
          transportMode: trip.preferences?.transport || trip.transport || "Driving",
        })
          .then((dist) => {
            if (dist) setCalculatedDistance(dist);
          })
          .catch(() => {});
      }
    }
  }, [trip, days, calculatedDistance]);

  const [weatherSummary, setWeatherSummary] = useState("Pleasant seasonal climate & clear skies");

  useEffect(() => {
    if (trip?.destination) {
      const dest = trip.destination.trim();
      fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          dest
        )}&count=1&language=en&format=json`
      )
        .then((res) => res.json())
        .then((geoData) => {
          if (geoData.results && geoData.results.length > 0) {
            const { latitude, longitude } = geoData.results[0];
            return fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
            );
          }
        })
        .then((wRes) => (wRes ? wRes.json() : null))
        .then((wData) => {
          if (wData?.current_weather) {
            const temp = Math.round(wData.current_weather.temperature);
            setWeatherSummary(`${temp}°C • Live weather for ${dest}`);
          }
        })
        .catch(() => {});
    }
  }, [trip]);

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
              {trip.preferences?.origin || trip.origin || (locationError ? locationError : currentLocation || "Current Location")}
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
                <span>🚶 LOCAL SIGHTSEEING</span>
                <strong>{formatTotalDistanceText(trip.totalDistanceKm || calculatedDistance)}</strong>
              </div>

              <div>
                <span>🌤️ WEATHER OVERVIEW</span>
                <strong>{weatherSummary}</strong>
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
                  <span>{day.icon || "📍"}</span>
                  <h3>{typeof day.title === "string" ? day.title.replace(/\*\*/g, "").replace(/^#+\s*/, "").trim() : day.title}</h3>
                </div>

                <div className="activities">
                  {Array.isArray(day.activities) ? (
                    day.activities.map((activity, index) => {
                      if (!activity || typeof activity !== "string") return null;

                      let text = activity.trim();
                      if (/^#+$|^[-*_]{3,}$/.test(text)) return null;
                      if (/^\|[\s\-:|]+\|?$/i.test(text)) return null;
                      if (/^\|\s*Time\s*\|\s*Activity\s*\|?$/i.test(text)) return null;
                      if (/^\|\s*Time\s*\|\s*Location\s*\|\s*Details\s*\|?$/i.test(text)) return null;

                      if (text.startsWith("|")) {
                        const cells = text.split("|").map((c) => c.trim()).filter(Boolean);
                        if (cells.length >= 2) {
                          if (/^\d{1,2}:\d{2}\s*(?:AM|PM)?$/i.test(cells[0])) {
                            text = `${cells[0]} – ${cells.slice(1).join(" - ")}`;
                          } else {
                            text = cells.join(" – ");
                          }
                        } else if (cells.length === 1) {
                          text = cells[0];
                        }
                      }

                      text = text.replace(/\*\*/g, "").replace(/__/g, "").replace(/`/g, "");
                      text = text
                        .replace(/^#+\s*/, "")
                        .replace(/^[-*•]\s*/, "")
                        .replace(/^\d+\.\s+/, "")
                        .trim();

                      if (!text) return null;

                      const isHeader =
                        /^(?:🌅|☀|🍽|🌇|🌆|🌙|Daily Summary|Trip Summary|Budget Snapshot|Cost Breakdown)/i.test(
                          text
                        ) || /^(?:Budget Snapshot|Cost Breakdown|Trip Summary)/i.test(text);

                      const isSummaryItem = /^(?:💰|🚶|🚗|🌤|🎒|🍲|- 💰|- 🚶|- 🚗|- 🌤|- 🎒|- 🍲)/.test(
                        text
                      );

                      if (isHeader) {
                        return (
                          <div
                            key={index}
                            className="activity-section-header"
                            style={{
                              gridColumn: "1 / -1",
                              fontWeight: "800",
                              fontSize: "14.5px",
                              color: "var(--primary, #0284c7)",
                              marginTop: index > 0 ? "14px" : "4px",
                              marginBottom: "4px",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <span>{text.startsWith("💰") ? text : `💰 ${text}`}</span>
                          </div>
                        );
                      }

                      if (isSummaryItem) {
                        return (
                          <div
                            key={index}
                            className="activity-summary-item"
                            style={{
                              gridColumn: "1 / -1",
                              fontSize: "13.5px",
                              color: "var(--text)",
                              background: "var(--surface)",
                              padding: "6px 12px",
                              borderRadius: "10px",
                              margin: "4px 0",
                              fontWeight: "600",
                            }}
                          >
                            {text}
                          </div>
                        );
                      }

                      return (
                        <div className="activity" key={index}>
                          <span className="activity-dot">✓</span>
                          <span>{text}</span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="activity" style={{ gridColumn: "1 / -1" }}>
                      <span className="activity-dot">✓</span>
                      <span>{typeof day.activities === "string" ? day.activities.replace(/\*\*/g, "").replace(/^#+\s*/, "") : "Explore local highlights & sightseeing."}</span>
                    </div>
                  )}
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