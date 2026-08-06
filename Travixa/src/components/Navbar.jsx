import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

import "../styles/Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const loggedIn =
    localStorage.getItem("travexaLoggedIn") === "true";

  const userName =
    localStorage.getItem("travexaUserName") || "Traveller";

  const handleLogout = () => {
    localStorage.removeItem("travexaLoggedIn");
    localStorage.removeItem("travexaUserName");

    navigate("/");
    window.location.reload();
  };

  const handlePlanTrip = () => {
    if (loggedIn) {
      navigate("/plan-trip");
    } else {
      navigate("/register");
    }
  };

  return (
    <nav className="navbar">
      {/* LOGO */}
      <div
        className="navbar-logo"
        onClick={() => navigate("/")}
      >
        ✈️ Travexa
      </div>

      {/* MENU */}
      <div className="navbar-menu">
        <button
          className={location.pathname === "/" ? "active" : ""}
          onClick={() => navigate("/")}
        >
          Home
        </button>

        {loggedIn && (
          <button
            className={location.pathname === "/dashboard" ? "active" : ""}
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </button>
        )}

        <button
          className={location.pathname === "/plan-trip" ? "active" : ""}
          onClick={handlePlanTrip}
        >
          Plan Trip
        </button>

        <button
          className={location.pathname === "/hotels" ? "active" : ""}
          onClick={() => navigate("/hotels")}
        >
          Hotels
        </button>

        <button
          className={location.pathname === "/weather" ? "active" : ""}
          onClick={() => navigate("/weather")}
        >
          Weather
        </button>

        <button
          className={location.pathname === "/maps" ? "active" : ""}
          onClick={() => navigate("/maps")}
        >
          Maps
        </button>

        <button
          className={location.pathname === "/about" ? "active" : ""}
          onClick={() => navigate("/about")}
        >
          About
        </button>
      </div>

      {/* RIGHT SIDE */}
      <div className="navbar-right">
        {loggedIn ? (
          <>
            <button
              className="navbar-profile"
              onClick={() => navigate("/profile")}
            >
              <span className="profile-icon">👤</span>
              <span className="profile-name">{userName}</span>
            </button>

            <button
              className="navbar-logout"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <button
            className="navbar-login"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        )}

        {/* DARK MODE */}
        <button
          className="navbar-theme"
          onClick={toggleTheme}
          title={
            theme === "dark"
              ? "Switch to Light Mode"
              : "Switch to Dark Mode"
          }
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;