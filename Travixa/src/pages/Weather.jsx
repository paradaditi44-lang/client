import "../styles/Weather.css";

function Weather() {
  const forecast = [
    { day: "Mon", icon: "☀️", temp: "30°C" },
    { day: "Tue", icon: "⛅", temp: "28°C" },
    { day: "Wed", icon: "🌧️", temp: "25°C" },
    { day: "Thu", icon: "☀️", temp: "31°C" },
    { day: "Fri", icon: "🌦️", temp: "27°C" },
  ];

  return (
    <div className="weather-page">
      <h1>🌤 Weather Forecast</h1>
      <p className="subtitle">
        Check the latest weather before your trip.
      </p>

      <div className="weather-card">
        <div className="weather-left">
          <h2>Tokyo, Japan</h2>
          <div className="weather-icon">☀️</div>
          <h1>30°C</h1>
          <p>Sunny</p>
        </div>

        <div className="weather-right">
          <p>💧 Humidity: <strong>65%</strong></p>
          <p>💨 Wind Speed: <strong>12 km/h</strong></p>
          <p>🌡 Feels Like: <strong>32°C</strong></p>
          <p>👀 Visibility: <strong>10 km</strong></p>
        </div>
      </div>

      <h2 className="forecast-title">📅 5-Day Forecast</h2>

      <div className="forecast-grid">
        {forecast.map((item, index) => (
          <div className="forecast-card" key={index}>
            <h3>{item.day}</h3>
            <div className="forecast-icon">{item.icon}</div>
            <p>{item.temp}</p>
          </div>
        ))}
      </div>

      <div className="travel-tip">
        <h3>💡 Travel Tip</h3>
        <p>
          The weather is sunny today. Carry sunglasses, sunscreen and stay hydrated.
        </p>
      </div>
    </div>
  );
}

export default Weather;