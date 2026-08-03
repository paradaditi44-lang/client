import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Footer from "../components/Footer";
import "../styles/Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Explorer");
  const [trips, setTrips] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [tripError, setTripError] = useState("");

  const [tripToDelete, setTripToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3500);
  };

  const formatDateRange = (startDateStr, endDateStr) => {
    if (!startDateStr) return "Flexible Dates";
    const start = new Date(startDateStr);
    const startFormatted = isNaN(start.getTime())
      ? startDateStr
      : start.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
    if (!endDateStr) return startFormatted;
    const end = new Date(endDateStr);
    const endFormatted = isNaN(end.getTime())
      ? endDateStr
      : end.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
    return `${startFormatted} - ${endFormatted}`;
  };

  const calculateDays = (trip) => {
    if (trip.days) return trip.days;
    if (trip.startDate && trip.endDate) {
      const start = new Date(trip.startDate);
      const end = new Date(trip.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 1;
    }
    return 3;
  };

  const getDestinationImage = (destination) => {
    if (!destination) return "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800";
    const destLower = destination.toLowerCase();
    if (destLower.includes("paris") || destLower.includes("france"))
      return "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800";
    if (destLower.includes("tokyo") || destLower.includes("japan"))
      return "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800";
    if (destLower.includes("mumbai") || destLower.includes("india"))
      return "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800";
    if (destLower.includes("london") || destLower.includes("uk"))
      return "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800";
    if (destLower.includes("bali") || destLower.includes("indonesia"))
      return "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800";
    if (destLower.includes("york") || destLower.includes("usa"))
      return "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800";
    return "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800";
  };

  const handleDeleteTrip = async () => {
    if (!tripToDelete) return;
    const tripId = tripToDelete.id || tripToDelete._id;
    try {
      setDeleting(true);
      const token =
        localStorage.getItem("travexaToken") || localStorage.getItem("token");
      await API.delete(`/trips/${tripId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTrips((prevTrips) =>
        prevTrips.filter((t) => (t.id || t._id) !== tripId)
      );
      showToast("Trip deleted successfully.", "success");
    } catch (error) {
      console.error("Error deleting trip:", error);
      showToast(
        error.response?.data?.message || "Failed to delete trip.",
        "error"
      );
    } finally {
      setDeleting(false);
      setTripToDelete(null);
    }
  };

  useEffect(() => {
    const storedName = localStorage.getItem("travexaUserName");
    if (storedName) {
      setUserName(storedName);
    }

    const fetchTrips = async () => {
      try {
        setLoadingTrips(true);
        setTripError("");
        const token =
          localStorage.getItem("travexaToken") || localStorage.getItem("token");
        if (!token) {
          setLoadingTrips(false);
          return;
        }
        const response = await API.get("/trips", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTrips(response.data?.trips || []);
      } catch (error) {
        console.error("Error fetching trips:", error);
        setTripError(
          error.response?.data?.message || "Failed to load your trips."
        );
      } finally {
        setLoadingTrips(false);
      }
    };

    fetchTrips();
  }, []);

  // Compute statistics
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalTrips = trips.length;
  const upcomingTrips = trips.filter((t) => {
    if (!t.startDate) return false;
    const start = new Date(t.startDate);
    return start >= today;
  }).length;

  const uniqueCountries = new Set(
    trips.map((t) => (t.destination ? t.destination.split(",").pop().trim() : "")).filter(Boolean)
  ).size;

  const totalBudgetPlanned = trips.reduce(
    (acc, t) => acc + (Number(t.budget) || 0),
    0
  );

  return (
    <div className="dashboard-root">
      <main className="dashboard-wrapper">
        {/* Welcome Hero Banner */}
        <section className="dashboard-hero-card">
          <div className="hero-content">
            <h1>Welcome Back 👋, {userName}!</h1>
            <p>Ready for your next adventure?</p>
          </div>
          <button className="btn-plan-hero" onClick={() => navigate("/plan-trip")}>
            ✨ + Plan New Trip
          </button>
        </section>

        {/* Statistics Cards Grid */}
        <section className="stats-dashboard-grid">
          <div className="stat-box">
            <div className="stat-icon-wrapper icon-blue">🧳</div>
            <div>
              <span className="stat-number">{loadingTrips ? "..." : totalTrips}</span>
              <span className="stat-label">Total Trips</span>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-icon-wrapper icon-cyan">🗓️</div>
            <div>
              <span className="stat-number">{loadingTrips ? "..." : upcomingTrips}</span>
              <span className="stat-label">Upcoming Trips</span>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-icon-wrapper icon-emerald">🌍</div>
            <div>
              <span className="stat-number">
                {loadingTrips ? "..." : (uniqueCountries || (totalTrips > 0 ? 1 : 0))}
              </span>
              <span className="stat-label">Countries Visited</span>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-icon-wrapper icon-orange">💰</div>
            <div>
              <span className="stat-number">
                {loadingTrips ? "..." : `₹${new Intl.NumberFormat("en-IN").format(totalBudgetPlanned)}`}
              </span>
              <span className="stat-label">Budget Planned</span>
            </div>
          </div>
        </section>

        {/* My Trips Header Bar */}
        <div className="dashboard-section-header">
          <div>
            <span className="section-eyebrow">YOUR SAVED ITINERARIES</span>
            <h2>My Trips ({trips.length})</h2>
          </div>
          <button className="btn-plan-secondary" onClick={() => navigate("/plan-trip")}>
            + Plan New Trip
          </button>
        </div>

        {/* Loading / Error / Empty States / Trips Grid */}
        {loadingTrips ? (
          <div className="dashboard-loading-card">
            <div className="loading-spinner"></div>
            <h2>Fetching your trips...</h2>
            <p>Please wait while we load your planned adventures.</p>
          </div>
        ) : tripError ? (
          <div className="dashboard-empty-card">
            <div className="empty-illustration">⚠️</div>
            <h2>Unable to load trips</h2>
            <p>{tripError}</p>
            <button className="btn-plan-hero" onClick={() => navigate("/plan-trip")}>
              ✨ Plan New Trip
            </button>
          </div>
        ) : trips.length === 0 ? (
          <div className="dashboard-empty-card">
            <div className="empty-illustration">🧳✈️🗺️</div>
            <h2>No trips planned yet</h2>
            <p>
              You haven't created any travel itineraries yet.
              <br />
              Let Travexa AI build your personalized trip in seconds!
            </p>
            <button className="btn-plan-hero" onClick={() => navigate("/plan-trip")}>
              ✨ Plan New Trip →
            </button>
          </div>
        ) : (
          <div className="vibrant-trips-grid">
            {trips.map((trip) => {
              const formattedBudget = !isNaN(Number(trip.budget))
                ? `₹${new Intl.NumberFormat("en-IN").format(Number(trip.budget))}`
                : trip.budget;
              const daysCount = calculateDays(trip);
              const travelStyle = trip.preferences?.travelStyle || trip.travelStyle || "General";

              return (
                <div key={trip.id || trip._id} className="vibrant-trip-card">
                  {/* Destination Image Cover */}
                  <div className="trip-card-image-wrap">
                    <img
                      src={getDestinationImage(trip.destination)}
                      alt={trip.destination}
                      className="trip-card-image"
                    />
                    <div className="trip-card-badges-top">
                      <span className="badge-days">🗓️ {daysCount} Days</span>
                      {trip.budget && <span className="badge-budget">{formattedBudget}</span>}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="trip-card-content">
                    <h3 className="trip-destination-title">
                      📍 {trip.destination}
                    </h3>

                    <div className="trip-card-info-list">
                      <div className="info-row">
                        <span className="info-icon">📅</span>
                        <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
                      </div>

                      {trip.numberOfTravelers && (
                        <div className="info-row">
                          <span className="info-icon">👥</span>
                          <span>
                            {trip.numberOfTravelers}{" "}
                            {trip.numberOfTravelers === 1 ? "Traveler" : "Travelers"}
                          </span>
                        </div>
                      )}

                      <div className="info-row">
                        <span className="info-icon">🎒</span>
                        <span style={{ textTransform: "capitalize" }}>{travelStyle}</span>
                      </div>
                    </div>

                    <div className="trip-card-actions-row">
                      <button
                        className="btn-view-details"
                        onClick={() => {
                          localStorage.setItem("travexaTrip", JSON.stringify(trip));
                          navigate("/trip-result", { state: { trip } });
                        }}
                      >
                        View Details →
                      </button>
                      <button
                        className="btn-delete-icon"
                        onClick={() => setTripToDelete(trip)}
                        title="Delete Trip"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Confirmation Modal */}
      {tripToDelete && (
        <div className="modal-overlay" onClick={() => !deleting && setTripToDelete(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">🗑️</div>
            <h3 className="modal-title">Delete Trip</h3>
            <p className="modal-message">
              Are you sure you want to delete this trip?
            </p>
            <div className="modal-actions">
              <button
                className="btn-modal-cancel"
                onClick={() => setTripToDelete(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="btn-modal-delete"
                onClick={handleDeleteTrip}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification toast-${toast.type}`}>
          <span>{toast.type === "success" ? "✓" : "⚠️"}</span>
          <span>{toast.message}</span>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Dashboard;