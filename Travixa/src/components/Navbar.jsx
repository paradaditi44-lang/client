import "../styles/Navbar.css";

function Navbar() {
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
    </nav>
  );
}

export default Navbar;