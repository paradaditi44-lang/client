import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/Profile.css";

function Profile() {
  const navigate = useNavigate();

  const [userName, setUserName] = useState("Travexa Traveler");
  const [userEmail, setUserEmail] = useState("traveller@example.com");

  const [stats, setStats] = useState({
    totalTrips: 0,
    upcomingTrips: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    // 1. Read user details from localStorage
    const storedName = localStorage.getItem("travexaUserName");
    const storedEmail = localStorage.getItem("travexaUserEmail");

    if (storedName) setUserName(storedName);
    if (storedEmail) setUserEmail(storedEmail);

    // 2. Fetch trips from GET /api/trips and calculate total & upcoming trips
    const fetchTripStats = async () => {
      try {
        setLoadingStats(true);
        const token =
          localStorage.getItem("travexaToken") || localStorage.getItem("token");

        if (!token) {
          setLoadingStats(false);
          return;
        }

        const response = await API.get("/trips", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const trips = response.data?.trips || [];

        // Calculate today's date at start of day
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const totalTrips = trips.length;
        const upcomingTrips = trips.filter((trip) => {
          if (!trip.startDate) return false;
          const startDate = new Date(trip.startDate);
          return startDate >= today;
        }).length;

        setStats({
          totalTrips,
          upcomingTrips,
        });
      } catch (error) {
        console.error("Error fetching trip statistics:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchTripStats();
  }, []);

  // 3. Logout action
  const handleLogout = () => {
    localStorage.removeItem("travexaToken");
    localStorage.removeItem("token");
    localStorage.removeItem("travexaLoggedIn");
    localStorage.removeItem("travexaUserName");
    localStorage.removeItem("travexaUserEmail");
    localStorage.removeItem("travexaTrip");
    localStorage.removeItem("travexaProfile");

    navigate("/login");
  };

  const getInitials = (name) => {
    if (!name) return "T";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <main className="profile-page">
      {/* Header */}
      <section className="profile-header">
        <div>
          <span className="profile-label">TRAVEXA ACCOUNT</span>
          <h1>User Profile</h1>
          <p>View your account information and travel history statistics.</p>
        </div>
      </section>

      {/* Main Profile Container */}
      <section className="profile-container">
        {/* Profile Main Card */}
        <div className="profile-card">
          {/* User Info Avatar & Header */}
          <div className="profile-top">
            <div className="profile-avatar">{getInitials(userName)}</div>
            <div>
              <h2>{userName}</h2>
              <p>{userEmail}</p>
              <span className="traveller-badge">✈️ Travexa Explorer</span>
            </div>
          </div>

          {/* User Info Grid */}
          <div className="profile-grid">
            <div className="profile-field">
              <label>FULL NAME</label>
              <div className="profile-value">👤 {userName}</div>
            </div>

            <div className="profile-field">
              <label>EMAIL ADDRESS</label>
              <div className="profile-value">📧 {userEmail}</div>
            </div>
          </div>

          {/* Travel Statistics Section */}
          <div className="stats-section">
            <div className="section-subtitle">📊 Travel Statistics</div>
            <div className="stats-grid">
              <div className="profile-stat-card">
                <div className="stat-icon">🧳</div>
                <div className="stat-info">
                  <h3>{loadingStats ? "..." : stats.totalTrips}</h3>
                  <p>Total Trips Created</p>
                </div>
              </div>

              <div className="profile-stat-card">
                <div className="stat-icon">🗓️</div>
                <div className="stat-info">
                  <h3>{loadingStats ? "..." : stats.upcomingTrips}</h3>
                  <p>Upcoming Trips</p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Management Section */}
          <div className="account-section">
            <div className="section-subtitle">⚙️ Account Settings</div>
            <div className="account-actions">
              <button
                className="btn-edit-disabled"
                disabled
                title="Profile editing is coming soon"
              >
                ✏️ Edit Profile (Coming Soon)
              </button>

              <button className="btn-logout" onClick={handleLogout}>
                🚪 Logout
              </button>
            </div>
          </div>
        </div>

        {/* Side Card */}
        <aside className="profile-side-card">
          <div className="side-icon">✨</div>
          <h3>Plan Your Next Adventure</h3>
          <p>
            Travexa AI creates tailored, day-by-day travel itineraries based on your preferences.
          </p>

          <div className="profile-benefits">
            <div>
              <span>✓</span> Personalised AI itineraries
            </div>
            <div>
              <span>✓</span> Live hotel & weather data
            </div>
            <div>
              <span>✓</span> Instant route mapping
            </div>
          </div>

          <button
            onClick={() => navigate("/plan-trip")}
            style={{
              marginTop: "25px",
              width: "100%",
              background: "white",
              color: "#1d4ed8",
              border: "none",
              padding: "13px",
              borderRadius: "12px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            ✨ Plan New Trip
          </button>
        </aside>
      </section>
    </main>
  );
}

export default Profile;