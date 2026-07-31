import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/Dashboard.css";
import Footer from "../components/Footer";

function Dashboard({ theme, toggleTheme }) {
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
    if (!startDateStr) return "Flexible Date";
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

  return (
    <div className={`dashboard ${theme || "light"}`}>
      <main className="dashboard-container">
        {/* Welcome Section */}
        <section
          style={{
            background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
            color: "white",
            padding: "35px 40px",
            borderRadius: "20px",
            marginBottom: "40px",
            boxShadow: "0 10px 25px rgba(37, 99, 235, 0.2)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <div>
            <span
              style={{
                fontSize: "14px",
                textTransform: "uppercase",
                letterSpacing: "1px",
                opacity: 0.9,
                fontWeight: 600,
              }}
            >
              ✨ Welcome Back
            </span>
            <h1
              style={{
                fontSize: "32px",
                margin: "8px 0",
                fontWeight: 700,
              }}
            >
              Hello, {userName}! 👋
            </h1>
            <p style={{ margin: 0, opacity: 0.9, fontSize: "16px" }}>
              Ready to plan your next extraordinary adventure with Travexa?
            </p>
          </div>
        </section>

        {/* My Trips Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "25px",
          }}
        >
          <h2 style={{ fontSize: "24px", fontWeight: 700, margin: 0 }}>
            🧳 My Trips
          </h2>
          <button
            onClick={() => navigate("/plan-trip")}
            style={{
              background: "#2563eb",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "10px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            + Plan New Trip
          </button>
        </div>

        {/* Loading State */}
        {loadingTrips ? (
          <div className="loading-card">
            <h2>⏳ Fetching your trips...</h2>
            <p>Please wait while we load your planned adventures.</p>
          </div>
        ) : tripError ? (
          <div className="empty-state">
            <div className="empty-icon">⚠️</div>
            <h2>Unable to load trips</h2>
            <p>{tripError}</p>
            <button
              onClick={() => navigate("/plan-trip")}
              style={{
                marginTop: "20px",
                background: "#2563eb",
                color: "white",
                border: "none",
                padding: "12px 24px",
                borderRadius: "10px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              ✨ Plan New Trip
            </button>
          </div>
        ) : trips.length === 0 ? (
          /* Empty State */
          <div className="empty-state">
            <div className="empty-icon">🗺️</div>
            <h2>No trips planned yet</h2>
            <p>
              You haven't created any travel itineraries yet.
              <br />
              Let Travexa AI build your personalized trip in seconds!
            </p>
            <span>🌍 Ready to explore the world?</span>
            <button
              onClick={() => navigate("/plan-trip")}
              style={{
                marginTop: "25px",
                background: "#2563eb",
                color: "white",
                border: "none",
                padding: "14px 28px",
                borderRadius: "12px",
                fontWeight: 700,
                fontSize: "15px",
                cursor: "pointer",
              }}
            >
              ✨ Plan New Trip →
            </button>
          </div>
        ) : (
          /* Trips List Grid */
          <div className="my-trips-grid">
            {trips.map((trip) => (
              <div key={trip.id || trip._id} className="trip-card">
                <div>
                  <div className="trip-card-header">
                    <h3 className="trip-card-destination">
                      📍 {trip.destination}
                    </h3>
                    {trip.budget && (
                      <span className="trip-card-budget">
                        💵 {
                          !isNaN(Number(trip.budget))
                            ? `₹${new Intl.NumberFormat("en-IN").format(Number(trip.budget))}`
                            : trip.budget
                        }
                      </span>
                    )}
                  </div>

                  <div className="trip-card-body">
                    <div className="trip-card-item">
                      <span className="trip-card-icon">📅</span>
                      <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
                    </div>

                    {trip.numberOfTravelers && (
                      <div className="trip-card-item">
                        <span className="trip-card-icon">👥</span>
                        <span>
                          {trip.numberOfTravelers}{" "}
                          {trip.numberOfTravelers === 1 ? "Traveler" : "Travelers"}
                        </span>
                      </div>
                    )}

                    {trip.preferences?.travelStyle && (
                      <div className="trip-card-item">
                        <span className="trip-card-icon">🎒</span>
                        <span style={{ textTransform: "capitalize" }}>
                          {trip.preferences.travelStyle}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <hr className="trip-card-divider" />
                  <div className="trip-card-actions">
                    <button
                      className="btn-view-itinerary"
                      onClick={() => {
                        localStorage.setItem("travexaTrip", JSON.stringify(trip));
                        navigate("/trip-result", { state: { trip } });
                      }}
                    >
                      View Itinerary →
                    </button>
                    <button
                      className="btn-delete-trip"
                      onClick={() => setTripToDelete(trip)}
                      title="Delete Trip"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
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