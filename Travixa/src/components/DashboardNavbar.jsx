import { Link } from "react-router-dom";
import "../styles/DashboardNavbar.css";

function DashboardNavbar({ theme, toggleTheme }) {
  return (
    <nav className="dashboard-navbar">
      <Link to="/" className="logo">
        ✈️ Travexa
      </Link>

      <ul className="nav-links">
        <li><Link to="/dashboard">Plan Trip</Link></li>
        <li><Link to="/hotels">Hotels</Link></li>
        <li><Link to="/weather">Weather</Link></li>
        <li><Link to="/maps">Maps</Link></li>
        <li><Link to="/about">About</Link></li>
      </ul>

      <div className="nav-right">
        <span>🔔</span>
        <span>👤 Aditi</span>

        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === "light" ? "🌙" : "☀️"}
        </button>
      </div>
    </nav>
  );
}

export default DashboardNavbar;