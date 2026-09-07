import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AITripResult from "../components/AITripResult";
import DestinationVideos from "../components/DestinationVideos/DestinationVideos";
import PackingChecklist from "../components/PackingChecklist";
import SmartBudgetOptimizer from "../components/SmartBudgetOptimizer";
import TripMemoryModal from "../components/TripMemoryModal";
import Footer from "../components/Footer";
import { generateItineraryPDF } from "../utils/generatePDF";
import { formatTotalDistanceText } from "../services/geocoding";
import API from "../services/api";
import "../styles/PlanTrip.css";
import "../styles/AITripResult.css";

function TripDetails() {
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [memory, setMemory] = useState(null);
  const [showMemoryModal, setShowMemoryModal] = useState(false);

  const loadTripMemory = async (currentTrip) => {
    if (!currentTrip) return;
    const tripId = currentTrip.id || currentTrip._id;

    try {
      const token = localStorage.getItem("travexaToken") || localStorage.getItem("token");
      if (token && tripId) {
        const res = await API.get(`/memories/trip/${tripId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data?.memory) {
          setMemory(res.data.memory);
          return;
        }
      }
    } catch (err) {
      console.warn("Backend memory fetch skipped:", err.message);
    }

    // Check localStorage cache
    try {
      const localStr = localStorage.getItem("travexaMemories");
      if (localStr) {
        const localObj = JSON.parse(localStr);
        if (localObj[tripId]) {
          setMemory(localObj[tripId]);
        }
      }
    } catch (e) {
      console.error("Failed to parse local memories:", e);
    }
  };

  const [weatherSummary, setWeatherSummary] = useState("Pleasant seasonal climate & clear skies");

  useEffect(() => {
    const savedTrip = localStorage.getItem("travexaTrip");
    if (savedTrip) {
      try {
        const parsed = JSON.parse(savedTrip);
        setTrip(parsed);
        loadTripMemory(parsed);
      } catch (e) {
        console.error("Error reading travexaTrip from localStorage:", e);
      }
    }
    setLoading(false);
  }, []);

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

  if (loading) {
    return (
      <main className="plan-trip-root">
        <div className="loading-card" style={{ marginTop: "80px", textAlign: "center" }}>
          <h2>⏳ Loading your trip details...</h2>
        </div>
      </main>
    );
  }

  // Friendly Empty State if no trip exists
  if (!trip) {
    return (
      <main className="plan-trip-root">
        <div className="plan-trip-wrapper">
          <div className="empty-state-glass" style={{ marginTop: "60px", padding: "60px 30px" }}>
            <div className="empty-icon-glow">🤖</div>
            <h2>No generated trip found</h2>
            <p>
              You haven't generated a trip itinerary yet. Fill out your preferences to create your customized AI travel plan!
            </p>
            <button
              className="primary-btn"
              onClick={() => navigate("/plan-trip")}
              style={{
                marginTop: "20px",
                padding: "14px 28px",
                background: "#0284c7",
                color: "#ffffff",
                border: "none",
                borderRadius: "14px",
                fontWeight: "700",
                fontSize: "15px",
                cursor: "pointer",
                boxShadow: "0 6px 20px rgba(2, 132, 199, 0.3)",
              }}
            >
              ✨ Plan a Trip
            </button>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  // Helpers for displaying details
  const displayOrigin = trip.preferences?.origin || trip.origin || "Current Location";
  const displayTravelers = trip.numberOfTravelers || trip.travellers || trip.travelers || 1;
  const displayBudget =
    typeof trip.budget === "number"
      ? `₹${trip.budget.toLocaleString()}`
      : trip.budget || "N/A";
  const displayCategory = trip.preferences?.travelStyle || trip.travelStyle || "Family";
  const displayTransport = trip.preferences?.transport || "Driving";
  const interestsList = Array.isArray(trip.preferences?.interests)
    ? trip.preferences.interests
    : Array.isArray(trip.interests)
    ? trip.interests
    : [];

  const displayTotalDistance = (() => {
    if (trip?.totalDistanceKm) {
      return formatTotalDistanceText(trip.totalDistanceKm);
    }
    let itineraryObj = trip?.itinerary;
    if (typeof itineraryObj === "string") {
      try {
        const parsed = JSON.parse(itineraryObj);
        if (parsed && (parsed.totalDistanceText || parsed.totalDistanceKm)) {
          itineraryObj = parsed;
        }
      } catch (e) {}
    }
    if (typeof itineraryObj === "object" && itineraryObj) {
      if (itineraryObj.totalDistanceText) return itineraryObj.totalDistanceText;
      if (itineraryObj.totalDistanceKm) return formatTotalDistanceText(itineraryObj.totalDistanceKm);
    }
    return formatTotalDistanceText(null);
  })();

  const calculateDays = (t) => {
    const currentTrip = t || trip;
    if (currentTrip?.startDate && currentTrip?.endDate) {
      const [sYear, sMonth, sDay] = String(currentTrip.startDate).split('-').map(Number);
      const [eYear, eMonth, eDay] = String(currentTrip.endDate).split('-').map(Number);
      if (sYear && sMonth && sDay && eYear && eMonth && eDay) {
        const startUtc = Date.UTC(sYear, sMonth - 1, sDay);
        const endUtc = Date.UTC(eYear, eMonth - 1, eDay);
        const diffMs = endUtc - startUtc;
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
        return Math.max(1, diffDays + 1);
      }
    }
    if (currentTrip?.days) return currentTrip.days;
    return 1;
  };

  const handleDownloadPDF = () => {
    let itineraryObj = trip?.itinerary;
    if (typeof itineraryObj === "string") {
      try {
        const parsed = JSON.parse(itineraryObj);
        if (parsed && (parsed.days || Array.isArray(parsed))) {
          itineraryObj = parsed;
        }
      } catch (e) {
        // Legacy markdown string
      }
    }

    let days = [];
    if (itineraryObj && Array.isArray(itineraryObj.days)) {
      days = itineraryObj.days;
    } else if (Array.isArray(itineraryObj)) {
      days = itineraryObj;
    }

    generateItineraryPDF(trip, days, calculateDays(trip));
  };

  return (
    <main className="plan-trip-root">
      {/* Background Orbs */}
      <div className="background-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <div className="plan-trip-wrapper">
        <header className="plan-trip-hero">
          <span className="hero-eyebrow">✨ YOUR TRIP DETAILS</span>
          <h1>{trip.destination ? `${trip.destination} Travel Plan` : "Your Trip Details"}</h1>
          <p>Explore your complete personalized itinerary, travel guides, and packing checklist below.</p>
        </header>

        {/* SECTION 1: TOP TRIP SUMMARY CARD */}
        <section className="trip-summary-card-section" style={{ marginBottom: "40px" }}>
          <div
            className="trip-summary"
            style={{
              background: "var(--card-bg, #ffffff)",
              borderRadius: "24px",
              padding: "30px",
              border: "1px solid var(--border, #e2e8f0)",
              boxShadow: "0 12px 36px rgba(2, 132, 199, 0.08)",
            }}
          >
            <div>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-secondary)", letterSpacing: "1px" }}>🛫 STARTING LOCATION</span>
              <strong style={{ fontSize: "16px", color: "var(--text)", display: "block", marginTop: "4px" }}>{displayOrigin}</strong>
            </div>

            <div>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-secondary)", letterSpacing: "1px" }}>📍 DESTINATION</span>
              <strong style={{ fontSize: "16px", color: "var(--text)", display: "block", marginTop: "4px" }}>{trip.destination || "N/A"}</strong>
            </div>

            <div>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-secondary)", letterSpacing: "1px" }}>🗓️ TOTAL DAYS</span>
              <strong style={{ fontSize: "16px", color: "var(--text)", display: "block", marginTop: "4px" }}>{calculateDays(trip)} Days ({trip.startDate || "N/A"} - {trip.endDate || "N/A"})</strong>
            </div>

            <div>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-secondary)", letterSpacing: "1px" }}>💰 ESTIMATED COST</span>
              <strong style={{ fontSize: "16px", color: "var(--text)", display: "block", marginTop: "4px" }}>{displayBudget}</strong>
            </div>

            <div>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-secondary)", letterSpacing: "1px" }}>👥 TRAVELERS</span>
              <strong style={{ fontSize: "16px", color: "var(--text)", display: "block", marginTop: "4px" }}>
                {displayCategory} ({displayTravelers} {displayTravelers === 1 ? "Person" : "People"})
              </strong>
            </div>

            <div>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-secondary)", letterSpacing: "1px" }}>🚗 TRAVEL STYLE</span>
              <strong style={{ fontSize: "16px", color: "var(--text)", display: "block", marginTop: "4px" }}>
                {displayTransport}
              </strong>
            </div>

            <div>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-secondary)", letterSpacing: "1px" }}>🚶 LOCAL SIGHTSEEING</span>
              <strong style={{ fontSize: "16px", color: "var(--text)", display: "block", marginTop: "4px" }}>
                {displayTotalDistance}
              </strong>
            </div>

            <div>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-secondary)", letterSpacing: "1px" }}>🌤️ WEATHER OVERVIEW</span>
              <strong style={{ fontSize: "15px", color: "var(--text)", display: "block", marginTop: "4px" }}>
                {weatherSummary}
              </strong>
            </div>

            {interestsList.length > 0 && (
              <div style={{ gridColumn: "1 / -1" }}>
                <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-secondary)", letterSpacing: "1px" }}>❤️ INTERESTS</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
                  {interestsList.map((interest, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: "12px",
                        fontWeight: "700",
                        color: "var(--primary)",
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        padding: "4px 12px",
                        borderRadius: "16px",
                      }}
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ gridColumn: "1 / -1", borderTop: "1px solid var(--border)", paddingTop: "14px", marginTop: "10px" }}>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-secondary)", letterSpacing: "1px" }}>🍲 BEST LOCAL FOODS</span>
              <p style={{ fontSize: "14px", color: "var(--text)", margin: "4px 0 0", fontWeight: "600" }}>
                Authentic regional thali, specialty local street delicacies, and traditional desserts.
              </p>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--text-secondary)", letterSpacing: "1px" }}>💡 ESSENTIAL TRAVEL TIPS</span>
              <ul style={{ fontSize: "13.5px", color: "var(--text)", margin: "6px 0 0", paddingLeft: "20px", lineHeight: "1.6" }}>
                <li>Keep digital and physical copies of tickets, hotel vouchers, and IDs.</li>
                <li>Reserve popular monument passes online in advance to skip ticket lines.</li>
                <li>Carry small cash bills for local markets and auto-rickshaw fares.</li>
                <li>Wear comfortable, broken-in walking shoes for day tours.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* SECTION 2: TRIP MEMORY / TRAVEL JOURNAL */}
        <section style={{ marginBottom: "40px" }}>
          <div
            style={{
              background: "var(--card-bg, #ffffff)",
              borderRadius: "24px",
              padding: "30px",
              border: "1px solid var(--border, #e2e8f0)",
              boxShadow: "0 12px 36px rgba(2, 132, 199, 0.08)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--primary, #0284c7)", letterSpacing: "1px" }}>📖 TRAVEL JOURNAL</span>
                <h3 style={{ fontSize: "22px", fontWeight: "800", color: "var(--text)", margin: "4px 0 0" }}>
                  {memory?.title || "Trip Memory & Travel Journal"}
                </h3>
              </div>

              <button
                onClick={() => setShowMemoryModal(true)}
                style={{
                  padding: "10px 20px",
                  borderRadius: "14px",
                  border: "none",
                  background: "linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)",
                  color: "#ffffff",
                  fontWeight: "800",
                  fontSize: "13.5px",
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(2, 132, 199, 0.25)",
                }}
              >
                {memory ? "✍️ Edit Journal" : "✨ Create Memory"}
              </button>
            </div>

            {memory ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Rating Display */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "20px", color: "#f59e0b" }}>
                    {"★".repeat(memory.rating || 5)}{"☆".repeat(5 - (memory.rating || 5))}
                  </span>
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-secondary)" }}>
                    {memory.rating || 5} / 5 Stars
                  </span>
                </div>

                {/* Personal Story */}
                {memory.notes && (
                  <div>
                    <span style={{ fontSize: "12px", fontWeight: "800", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                      📝 PERSONAL STORY & NOTES
                    </span>
                    <p style={{ fontSize: "14.5px", lineHeight: "1.6", color: "var(--text)", margin: 0, whiteSpace: "pre-wrap" }}>
                      {memory.notes}
                    </p>
                  </div>
                )}

                {/* Favorite Moments */}
                {memory.favoriteMoments && (
                  <div>
                    <span style={{ fontSize: "12px", fontWeight: "800", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                      🌟 FAVORITE MOMENTS
                    </span>
                    <p style={{ fontSize: "14px", color: "var(--text)", margin: 0 }}>
                      {memory.favoriteMoments}
                    </p>
                  </div>
                )}

                {/* Places Visited */}
                {memory.placesVisited && (
                  <div>
                    <span style={{ fontSize: "12px", fontWeight: "800", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                      📍 PLACES VISITED
                    </span>
                    <p style={{ fontSize: "14px", color: "var(--text)", margin: 0 }}>
                      {memory.placesVisited}
                    </p>
                  </div>
                )}

                {/* Photos Gallery */}
                {Array.isArray(memory.photos) && memory.photos.length > 0 && (
                  <div>
                    <span style={{ fontSize: "12px", fontWeight: "800", color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>
                      📷 TRIP PHOTOS ({memory.photos.length})
                    </span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                      {memory.photos.map((pUrl, idx) => (
                        <img
                          key={idx}
                          src={pUrl}
                          alt={`Memory photo ${idx + 1}`}
                          style={{
                            width: "110px",
                            height: "110px",
                            objectFit: "cover",
                            borderRadius: "14px",
                            border: "1px solid var(--border)",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: 0 }}>
                You haven't recorded a travel journal memory for this trip yet. Click <strong>Create Memory</strong> to add stories, favorite moments, ratings, and photos!
              </p>
            )}
          </div>
        </section>

        {/* SECTION 3: AI TRIP RESULT (ITINERARY TIMELINE) */}
        <section style={{ marginBottom: "40px" }}>
          <AITripResult trip={trip} showSummary={false} showExtras={false} />
        </section>

        {/* SECTION 4: DESTINATION VIDEOS */}
        <section style={{ marginBottom: "40px" }}>
          <DestinationVideos destination={trip.destination} />
        </section>

        {/* SECTION 5: PACKING CHECKLIST */}
        <section style={{ marginBottom: "40px" }}>
          <PackingChecklist
            destination={trip.destination}
            travelStyle={displayCategory}
            duration={calculateDays(trip)}
          />
        </section>

        {/* SECTION 6: SMART BUDGET OPTIMIZER */}
        <SmartBudgetOptimizer trip={trip} />

        {/* SECTION 7: DOWNLOAD PDF */}
        <section style={{ marginBottom: "40px" }}>
          <div
            className="placeholder-feature-card"
            style={{
              background: "var(--card-bg, #ffffff)",
              border: "1.5px dashed #10b981",
              borderRadius: "24px",
              padding: "26px 30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "16px",
              boxShadow: "0 8px 24px rgba(16, 185, 129, 0.06)",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                <span style={{ fontSize: "26px" }}>📄</span>
                <h3 style={{ fontSize: "20px", fontWeight: "800", color: "var(--text)", margin: 0 }}>
                  Download PDF
                </h3>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "800",
                    color: "#10b981",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    padding: "4px 12px",
                    borderRadius: "14px",
                    letterSpacing: "0.5px",
                  }}
                >
                  AVAILABLE NOW
                </span>
              </div>
              <p style={{ fontSize: "14.5px", color: "var(--text-secondary)", margin: 0 }}>
                Export your full trip details, day-by-day activities, and packing checklist as a PDF document.
              </p>
            </div>
            <button
              onClick={handleDownloadPDF}
              style={{
                padding: "12px 24px",
                borderRadius: "14px",
                border: "none",
                background: "#10b981",
                color: "#ffffff",
                fontWeight: "700",
                fontSize: "14px",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(16, 185, 129, 0.25)",
                transition: "transform 0.2s ease",
              }}
            >
              📄 Download PDF
            </button>
          </div>
        </section>

        {/* BOTTOM: PLAN ANOTHER TRIP BUTTON */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: "20px", marginBottom: "40px" }}>
          <button
            onClick={() => navigate("/plan-trip")}
            style={{
              padding: "16px 36px",
              borderRadius: "16px",
              border: "1px solid var(--border)",
              background: "var(--card-bg, #ffffff)",
              color: "var(--primary)",
              fontWeight: "800",
              fontSize: "16px",
              cursor: "pointer",
              boxShadow: "0 6px 20px rgba(2, 132, 199, 0.12)",
              transition: "all 0.3s ease",
            }}
          >
            🔄 Plan Another Trip
          </button>
        </div>
      </div>

      {/* Trip Memory Modal */}
      {showMemoryModal && (
        <TripMemoryModal
          trip={trip}
          existingMemory={memory}
          onClose={() => setShowMemoryModal(false)}
          onSave={(savedMem) => {
            setMemory(savedMem);
          }}
        />
      )}

      <Footer />
    </main>
  );
}

export default TripDetails;
