import "../styles/Home.css";

function Home() {
  return (
    <div className="home">

      <h1>🌍 Explore the World with Travexa</h1>

      <p>
        Your AI-powered travel planner that helps you discover
        destinations, hotels, weather updates, and smart itineraries.
      </p>

      <button>✈️ Start Planning</button>

      <div className="cards">

        <div className="card">
          <h2>🤖 AI Planner</h2>
          <p>Create personalized travel plans instantly.</p>
        </div>

        <div className="card">
          <h2>🏨 Hotels</h2>
          <p>Find the best hotels at affordable prices.</p>
        </div>

        <div className="card">
          <h2>🌦 Weather</h2>
          <p>Get live weather updates before your trip.</p>
        </div>

        <div className="card">
          <h2>📍 Explore</h2>
          <p>Discover amazing places around the world.</p>
        </div>

      </div>

    </div>
  );
}

export default Home;