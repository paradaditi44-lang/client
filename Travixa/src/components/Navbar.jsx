
import { Link } from "react-router-dom";
import "../styles/Navbar.css";

function Navbar({ toggleTheme, theme }) {
  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        ✈️ Travexa
      </Link>

      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/dashboard">Plan Trip</Link></li>
        <li><Link to="/hotels">Hotels</Link></li>
        <li><Link to="/weather">Weather</Link></li>
        <li><Link to="/about">About</Link></li>
      </ul>

      <Link to="/login" className="login-btn">
        Login
      </Link>

      <button className="theme-toggle" onClick={toggleTheme}>
        {theme === "light" ? "🌙" : "☀️"}
      </button>
    </nav>
  );
}

export default Navbar;