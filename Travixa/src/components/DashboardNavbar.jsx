import "../styles/DashboardNavbar.css";

function DashboardNavbar() {
  return (
    <nav className="dashboard-navbar">

      <div className="logo">
        ✈️ <span>Travexa</span>
      </div>

      <ul className="nav-links">
        <li>Dashboard</li>
        <li>Plan Trip</li>
        <li>Hotels</li>
        <li>Weather</li>
        <li>Maps</li>
        <li>Explore</li>
      </ul>

      <div className="profile">
        🔔
        <span>👤 Aditi ▼</span>
      </div>

    </nav>
  );
}

export default DashboardNavbar;