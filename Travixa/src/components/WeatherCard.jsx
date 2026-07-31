import React, { useState, useEffect } from 'react';
import './WeatherCard.css';

/**
 * Travexa Smart WeatherCard
 * 
 * Includes:
 * - Smart Fuzzy Geocoding Engine (handles country names, state names, typos like "afganisthan", "rajasthan")
 * - Country to Capital mapping dictionary
 * - OpenStreetMap Nominatim + Open-Meteo + OpenWeatherMap multi-level fallback
 * - Real-time live weather for any city, country, or region worldwide
 */

// Country & State / Region to Main City / Capital Auto-Map (handles common typos too!)
const LOCATION_ALIASES = {
  // Common typo & country aliases
  afganisthan: { name: 'Kabul', country: 'AF' },
  afganistan: { name: 'Kabul', country: 'AF' },
  afghanistan: { name: 'Kabul', country: 'AF' },
  india: { name: 'New Delhi', country: 'IN' },
  rajasthan: { name: 'Jaipur', country: 'IN' },
  maharashtra: { name: 'Mumbai', country: 'IN' },
  karnataka: { name: 'Bengaluru', country: 'IN' },
  punjab: { name: 'Chandigarh', country: 'IN' },
  kerala: { name: 'Thiruvananthapuram', country: 'IN' },
  japan: { name: 'Tokyo', country: 'JP' },
  france: { name: 'Paris', country: 'FR' },
  germany: { name: 'Berlin', country: 'DE' },
  italy: { name: 'Rome', country: 'IT' },
  spain: { name: 'Madrid', country: 'ES' },
  uk: { name: 'London', country: 'GB' },
  'united kingdom': { name: 'London', country: 'GB' },
  england: { name: 'London', country: 'GB' },
  usa: { name: 'Washington D.C.', country: 'US' },
  'united states': { name: 'Washington D.C.', country: 'US' },
  america: { name: 'New York', country: 'US' },
  california: { name: 'Los Angeles', country: 'US' },
  texas: { name: 'Houston', country: 'US' },
  canada: { name: 'Toronto', country: 'CA' },
  australia: { name: 'Sydney', country: 'AU' },
  china: { name: 'Beijing', country: 'CN' },
  brazil: { name: 'Rio de Janeiro', country: 'BR' },
  russia: { name: 'Moscow', country: 'RU' },
  indonesia: { name: 'Jakarta', country: 'ID' },
  bali: { name: 'Denpasar', country: 'ID' },
  thailand: { name: 'Bangkok', country: 'TH' },
  vietnam: { name: 'Hanoi', country: 'VN' },
  egypt: { name: 'Cairo', country: 'EG' },
  turkey: { name: 'Istanbul', country: 'TR' },
  turkiye: { name: 'Istanbul', country: 'TR' },
  'south korea': { name: 'Seoul', country: 'KR' },
  korea: { name: 'Seoul', country: 'KR' },
  mexico: { name: 'Mexico City', country: 'MX' },
  uae: { name: 'Dubai', country: 'AE' },
  'united arab emirates': { name: 'Dubai', country: 'AE' },
  saudi: { name: 'Riyadh', country: 'SA' },
  'saudi arabia': { name: 'Riyadh', country: 'SA' },
  singapore: { name: 'Singapore', country: 'SG' },
  malaysia: { name: 'Kuala Lumpur', country: 'MY' }
};

const parseWMOCode = (code) => {
  if (code === 0) return { main: 'Clear', description: 'Sunny & Clear', icon: '01d' };
  if (code >= 1 && code <= 3) return { main: 'Clouds', description: 'Partly Cloudy', icon: '02d' };
  if (code === 45 || code === 48) return { main: 'Fog', description: 'Foggy', icon: '50d' };
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return { main: 'Rain', description: 'Rainy', icon: '10d' };
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return { main: 'Snow', description: 'Snowy', icon: '13d' };
  if (code >= 95 && code <= 99) return { main: 'Thunderstorm', description: 'Thunderstorm', icon: '11d' };
  return { main: 'Clear', description: 'Clear sky', icon: '01d' };
};

const WeatherCard = ({ defaultCity = 'Seoul', apiKey = '', className = '' }) => {
  const [cityInput, setCityInput] = useState('');
  const [searchCity, setSearchCity] = useState(defaultCity);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState('C');
  
  const [userApiKey, setUserApiKey] = useState(() => {
    return (
      apiKey ||
      localStorage.getItem('travexa_openweather_key') ||
      import.meta.env?.VITE_OPENWEATHER_API_KEY ||
      ''
    );
  });
  
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [isUsingOpenWeather, setIsUsingOpenWeather] = useState(false);

  const quickCities = ['Seoul', 'Tokyo', 'Paris', 'New York', 'Bali', 'London'];

  const fetchWeather = async (targetQuery) => {
    if (!targetQuery.trim()) return;

    setLoading(true);
    setError(null);

    const activeKey = userApiKey.trim();
    const rawQuery = targetQuery.trim().toLowerCase();
    
    // Check if user entered a country/state or known typo alias
    let searchTarget = targetQuery.trim();
    if (LOCATION_ALIASES[rawQuery]) {
      searchTarget = LOCATION_ALIASES[rawQuery].name;
    }

    // ----------------------------------------------------------------------
    // 1. OpenWeatherMap API (if user provided an API Key)
    // ----------------------------------------------------------------------
    if (activeKey) {
      try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
          searchTarget
        )}&units=metric&appid=${activeKey}`;

        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
          setWeatherData(data);
          setIsUsingOpenWeather(true);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('OpenWeatherMap fetch failed, using smart geocoding fallback:', err);
      }
    }

    // ----------------------------------------------------------------------
    // 2. Smart Multi-Level Geocoding Engine (Open-Meteo + OpenStreetMap)
    // ----------------------------------------------------------------------
    try {
      setIsUsingOpenWeather(false);
      let latitude, longitude, placeName, countryCode;

      // Method A: Open-Meteo Geocoding
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        searchTarget
      )}&count=5&language=en&format=json`;

      const geoRes = await fetch(geoUrl);
      const geoData = await geoRes.json();

      if (geoData.results && geoData.results.length > 0) {
        const queryLower = searchTarget.toLowerCase().trim();
        const rawLower = targetQuery.toLowerCase().trim();

        // 1. Prefer an exact city name match (case-insensitive)
        const exactMatch = geoData.results.find(
          (item) =>
            item.name &&
            (item.name.toLowerCase().trim() === queryLower ||
              item.name.toLowerCase().trim() === rawLower)
        );

        // 2. Use exact match if exists, otherwise fall back to first result
        const bestMatch = exactMatch || geoData.results[0];
        latitude = bestMatch.latitude;
        longitude = bestMatch.longitude;
        placeName = bestMatch.name;
        countryCode = bestMatch.country_code || bestMatch.country;
      } else {
        // Method B: OpenStreetMap Nominatim Fuzzy Geocoding Fallback
        const nomUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          targetQuery
        )}&format=json&limit=5`;

        const nomRes = await fetch(nomUrl, {
          headers: { 'Accept-Language': 'en' }
        });
        const nomData = await nomRes.json();

        if (nomData && nomData.length > 0) {
          const queryLower = searchTarget.toLowerCase().trim();
          const rawLower = targetQuery.toLowerCase().trim();

          const exactNomMatch = nomData.find((item) => {
            if (!item.display_name) return false;
            const firstName = item.display_name.split(',')[0].toLowerCase().trim();
            return firstName === queryLower || firstName === rawLower;
          });

          const nomMatch = exactNomMatch || nomData[0];
          latitude = parseFloat(nomMatch.lat);
          longitude = parseFloat(nomMatch.lon);
          // Split display name for clean city formatting
          const nameParts = nomMatch.display_name.split(',');
          placeName = nameParts[0].trim();
          countryCode = nameParts[nameParts.length - 1].trim().slice(0, 2).toUpperCase();
        } else {
          throw new Error('City not found. Please enter a valid city name.');
        }
      }

      // Step 3: Fetch Weather for resolved coordinates
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=relativehumidity_2m,surface_pressure,apparent_temperature&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;

      const weatherRes = await fetch(weatherUrl);
      const data = await weatherRes.json();

      if (!data.current_weather) {
        throw new Error('City not found. Please enter a valid city name.');
      }

      const current = data.current_weather;
      const condition = parseWMOCode(current.weathercode);
      const currentHourIndex = new Date().getHours();
      
      const humidity = data.hourly?.relativehumidity_2m?.[currentHourIndex] ?? 65;
      const pressure = Math.round(data.hourly?.surface_pressure?.[currentHourIndex] ?? 1013);
      const feelsLike = data.hourly?.apparent_temperature?.[currentHourIndex] ?? current.temperature;
      const tempMax = data.daily?.temperature_2m_max?.[0] ?? Math.round(current.temperature + 4);
      const tempMin = data.daily?.temperature_2m_min?.[0] ?? Math.round(current.temperature - 3);

      const formattedData = {
        name: placeName,
        sys: { country: countryCode || '' },
        main: {
          temp: current.temperature,
          feels_like: feelsLike,
          temp_min: tempMin,
          temp_max: tempMax,
          humidity: humidity,
          pressure: pressure
        },
        wind: {
          speed: current.windspeed,
          deg: current.winddirection
        },
        visibility: 10000,
        weather: [
          {
            id: current.weathercode,
            main: condition.main,
            description: condition.description,
            icon: condition.icon
          }
        ]
      };

      setWeatherData(formattedData);
    } catch (err) {
      setError(err.message || 'City not found. Please enter a valid city name.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(searchCity);
  }, [searchCity, userApiKey]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (cityInput.trim()) {
      setSearchCity(cityInput.trim());
    }
  };

  const handleQuickCityClick = (city) => {
    setCityInput(city);
    setSearchCity(city);
  };

  const handleSaveApiKey = () => {
    const keyToSave = userApiKey.trim();
    localStorage.setItem('travexa_openweather_key', keyToSave);
    setShowApiKeyInput(false);
    fetchWeather(searchCity);
  };

  const formatTemp = (celsiusTemp) => {
    if (celsiusTemp === undefined || celsiusTemp === null) return '--';
    if (unit === 'F') {
      const fahrenheit = (celsiusTemp * 9) / 5 + 32;
      return `${Math.round(fahrenheit)}°`;
    }
    return `${Math.round(celsiusTemp)}°`;
  };

  const getWeatherThemeClass = () => {
    if (!weatherData || !weatherData.weather || !weatherData.weather[0]) return 'theme-clear';
    const mainCondition = weatherData.weather[0].main.toLowerCase();
    if (mainCondition.includes('cloud')) return 'theme-clouds';
    if (mainCondition.includes('rain') || mainCondition.includes('drizzle')) return 'theme-rain';
    if (mainCondition.includes('thunder') || mainCondition.includes('storm')) return 'theme-storm';
    if (mainCondition.includes('snow')) return 'theme-snow';
    if (mainCondition.includes('mist') || mainCondition.includes('fog') || mainCondition.includes('haze')) return 'theme-mist';
    return 'theme-clear';
  };

  return (
    <div className={`twc-container ${getWeatherThemeClass()} ${className}`}>
      {/* Search Header */}
      <div className="twc-header">
        <form onSubmit={handleSearchSubmit} className="twc-search-form">
          <div className="twc-search-input-wrapper">
            <svg className="twc-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="twc-search-input"
              placeholder="Search city, country, or state (e.g. Afghanistan, Rajasthan, Seoul)..."
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
            />
            {cityInput && (
              <button
                type="button"
                className="twc-clear-btn"
                onClick={() => setCityInput('')}
                title="Clear"
              >
                ✕
              </button>
            )}
          </div>
          <button type="submit" className="twc-search-btn">
            Search
          </button>
        </form>

        {/* Quick Destinations */}
        <div className="twc-quick-cities">
          <span className="twc-quick-label">Popular:</span>
          {quickCities.map((city) => (
            <button
              key={city}
              type="button"
              className={`twc-chip ${searchCity.toLowerCase() === city.toLowerCase() ? 'active' : ''}`}
              onClick={() => handleQuickCityClick(city)}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* API Key Bar */}
      <div className="twc-api-bar">
        <div className="twc-live-badge">
          <span className="twc-dot live"></span>
          <span>{isUsingOpenWeather ? 'OpenWeatherMap API' : 'Live Real-Time Weather'}</span>
          <button
            type="button"
            className="twc-api-toggle-link"
            onClick={() => setShowApiKeyInput(!showApiKeyInput)}
          >
            {showApiKeyInput ? 'Hide Setup' : userApiKey ? 'Change OpenWeather Key' : 'Enter OpenWeather Key'}
          </button>
        </div>

        {showApiKeyInput && (
          <div className="twc-api-drawer">
            <input
              type="password"
              className="twc-api-input"
              placeholder="Paste your OpenWeatherMap API Key..."
              value={userApiKey}
              onChange={(e) => setUserApiKey(e.target.value)}
            />
            <button
              type="button"
              className="twc-api-save-btn"
              onClick={handleSaveApiKey}
            >
              Save Key
            </button>
          </div>
        )}
      </div>

      {/* Main Body */}
      <div className="twc-body">
        {/* Loading Spinner */}
        {loading && (
          <div className="twc-loading-state">
            <div className="twc-spinner"></div>
            <p className="twc-loading-text">Finding weather for {searchCity}...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="twc-error-state">
            <div className="twc-error-icon">⚠️</div>
            <h4 className="twc-error-title">Weather Unavailable</h4>
            <p className="twc-error-msg">{error}</p>
            <button
              type="button"
              className="twc-retry-btn"
              onClick={() => fetchWeather(searchCity)}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Weather Content */}
        {!loading && !error && weatherData && (
          <div className="twc-content">
            {/* Top Bar */}
            <div className="twc-top-bar">
              <div className="twc-location">
                <div className="twc-city-header">
                  <h3 className="twc-city-name">{weatherData.name}</h3>
                  {weatherData.sys?.country && (
                    <span className="twc-country-badge">{weatherData.sys.country}</span>
                  )}
                </div>
                <p className="twc-date-time">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>

              {/* Unit Toggle Switch */}
              <div className="twc-unit-toggle">
                <button
                  type="button"
                  className={`twc-unit-btn ${unit === 'C' ? 'active' : ''}`}
                  onClick={() => setUnit('C')}
                >
                  °C
                </button>
                <button
                  type="button"
                  className={`twc-unit-btn ${unit === 'F' ? 'active' : ''}`}
                  onClick={() => setUnit('F')}
                >
                  °F
                </button>
              </div>
            </div>

            {/* Main Temperature Display */}
            <div className="twc-main-display">
              <div className="twc-temp-block">
                <div className="twc-temp-value">
                  {formatTemp(weatherData.main?.temp)}
                </div>
                <div className="twc-temp-details">
                  <span className="twc-condition-text">
                    {weatherData.weather?.[0]?.description || 'Clear sky'}
                  </span>
                  <div className="twc-temp-range">
                    <span>H: {formatTemp(weatherData.main?.temp_max)}</span>
                    <span className="twc-dot-separator">•</span>
                    <span>L: {formatTemp(weatherData.main?.temp_min)}</span>
                  </div>
                </div>
              </div>

              {/* Weather Icon */}
              <div className="twc-icon-wrapper">
                {weatherData.weather?.[0]?.icon ? (
                  <img
                    src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@4x.png`}
                    alt={weatherData.weather[0].description || 'Weather condition'}
                    className="twc-weather-icon"
                  />
                ) : (
                  <div className="twc-fallback-icon">☀️</div>
                )}
              </div>
            </div>

            {/* Feels like banner */}
            <div className="twc-feels-banner">
              <span>Feels like <strong>{formatTemp(weatherData.main?.feels_like)}</strong></span>
            </div>

            {/* Weather Metrics Grid */}
            <div className="twc-metrics-grid">
              {/* Humidity */}
              <div className="twc-metric-card">
                <div className="twc-metric-header">
                  <svg className="twc-metric-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                  </svg>
                  <span className="twc-metric-label">Humidity</span>
                </div>
                <div className="twc-metric-value">{weatherData.main?.humidity ?? '--'}%</div>
                <div className="twc-progress-bar">
                  <div
                    className="twc-progress-fill humidity"
                    style={{ width: `${Math.min(100, weatherData.main?.humidity || 0)}%` }}
                  ></div>
                </div>
              </div>

              {/* Wind Speed */}
              <div className="twc-metric-card">
                <div className="twc-metric-header">
                  <svg className="twc-metric-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
                  </svg>
                  <span className="twc-metric-label">Wind Speed</span>
                </div>
                <div className="twc-metric-value">
                  {weatherData.wind?.speed ? `${weatherData.wind.speed} m/s` : '--'}
                </div>
                <div className="twc-metric-subtext">
                  ~{weatherData.wind?.speed ? Math.round(weatherData.wind.speed * 3.6) : '--'} km/h
                </div>
              </div>

              {/* Pressure */}
              <div className="twc-metric-card">
                <div className="twc-metric-header">
                  <svg className="twc-metric-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  <span className="twc-metric-label">Pressure</span>
                </div>
                <div className="twc-metric-value">{weatherData.main?.pressure ?? '--'} hPa</div>
                <div className="twc-metric-subtext">Atmospheric</div>
              </div>

              {/* Visibility */}
              <div className="twc-metric-card">
                <div className="twc-metric-header">
                  <svg className="twc-metric-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <span className="twc-metric-label">Visibility</span>
                </div>
                <div className="twc-metric-value">
                  {weatherData.visibility ? `${(weatherData.visibility / 1000).toFixed(1)} km` : '10 km'}
                </div>
                <div className="twc-metric-subtext">Clear distance</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherCard;