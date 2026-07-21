
import "../styles/Navbar.css";

function Navbar({ toggleTheme, theme }) {
  return (
    <nav className="navbar">
      <h2 className="logo">✈️ Travexa</h2>

      <ul className="nav-links">
        <li>Home</li>
        <li>Plan Trip</li>
        <li>Hotels</li>
        <li>Weather</li>
        <li>About</li>
      </ul>

      <button className="login-btn">Login</button>

     <button className="theme-toggle" onClick={toggleTheme}>
  {theme === "light" ? "🌙" : "☀️"}
</button>
    </nav>
  );
}

export default Navbar;