import "../styles/AITripResult.css";

function AITripResult({ trip }) {
  if (!trip) return null;

  const destination = trip.destination.toLowerCase();

  let itinerary = [];

  // ==========================
  // JAPAN
  // ==========================
  if (destination.includes("japan")) {
    itinerary = [
      {
        day: "📅 Day 1 – Arrival & City Tour",
        morning: [
          "🏨 Check into your hotel",
          "🗼 Visit Tokyo Tower",
        ],
        afternoon: [
          "🚶 Explore Shibuya Crossing",
          "🐕 Visit Hachiko Statue",
        ],
        evening: [
          "🍣 Sushi Dinner",
          "🌆 Walk around Shinjuku",
        ],
      },
      {
        day: "📅 Day 2 – Nature & Relaxation",
        morning: [
          "⛰ Visit Mt. Fuji",
        ],
        afternoon: [
          "🌊 Explore Lake Kawaguchi",
        ],
        evening: [
          "♨ Relax at a Japanese Onsen",
        ],
      },
      {
        day: "📅 Day 3 – Culture & Shopping",
        morning: [
          "⛩ Visit Fushimi Inari Shrine",
        ],
        afternoon: [
          "🎋 Walk through Bamboo Forest",
        ],
        evening: [
          "🛍 Shop at Nishiki Market",
        ],
      },
    ];
  }

  // ==========================
  // LONDON
  // ==========================
  else if (
    destination.includes("london") ||
    destination.includes("uk") ||
    destination.includes("england")
  ) {
    itinerary = [
      {
        day: "📅 Day 1 – Royal London",
        morning: [
          "👑 Buckingham Palace",
          "📸 Changing of Guards",
        ],
        afternoon: [
          "🕰 Big Ben",
          "🏛 Westminster Abbey",
        ],
        evening: [
          "🎡 London Eye",
          "🍽 Dinner beside River Thames",
        ],
      },
      {
        day: "📅 Day 2 – History",
        morning: [
          "🌉 Tower Bridge",
        ],
        afternoon: [
          "🏰 Tower of London",
        ],
        evening: [
          "🚢 Thames River Cruise",
        ],
      },
      {
        day: "📅 Day 3 – Shopping",
        morning: [
          "🌳 Hyde Park",
        ],
        afternoon: [
          "🛍 Oxford Street",
        ],
        evening: [
          "🎭 Covent Garden",
        ],
      },
    ];
  }

  // ==========================
  // PARIS
  // ==========================
  else if (
    destination.includes("paris") ||
    destination.includes("france")
  ) {
    itinerary = [
      {
        day: "📅 Day 1 – Paris Highlights",
        morning: [
          "🗼 Eiffel Tower",
        ],
        afternoon: [
          "🚢 Seine River Cruise",
        ],
        evening: [
          "🥐 French Dinner",
        ],
      },
      {
        day: "📅 Day 2 – Art & Culture",
        morning: [
          "🎨 Louvre Museum",
        ],
        afternoon: [
          "⛪ Notre-Dame Cathedral",
        ],
        evening: [
          "☕ Paris Café",
        ],
      },
      {
        day: "📅 Day 3 – Fun",
        morning: [
          "🎢 Disneyland Paris",
        ],
        afternoon: [
          "🛍 Champs-Élysées",
        ],
        evening: [
          "🌃 Night Walk",
        ],
      },
    ];
  }

  // ==========================
  // DUBAI
  // ==========================
  else if (destination.includes("dubai")) {
    itinerary = [
      {
        day: "📅 Day 1 – City Tour",
        morning: [
          "🏙 Burj Khalifa",
        ],
        afternoon: [
          "🛍 Dubai Mall",
        ],
        evening: [
          "🎵 Dubai Fountain Show",
        ],
      },
      {
        day: "📅 Day 2 – Desert Adventure",
        morning: [
          "🏜 Desert Safari",
        ],
        afternoon: [
          "🐪 Camel Ride",
        ],
        evening: [
          "🍖 BBQ Dinner",
        ],
      },
      {
        day: "📅 Day 3 – Beaches",
        morning: [
          "🌴 Palm Jumeirah",
        ],
        afternoon: [
          "🚤 Marina Cruise",
        ],
        evening: [
          "🌅 JBR Beach",
        ],
      },
    ];
  }

  // ==========================
  // GOA
  // ==========================
  else if (destination.includes("goa")) {
    itinerary = [
      {
        day: "📅 Day 1 – Beaches",
        morning: [
          "🏖 Baga Beach",
        ],
        afternoon: [
          "🌅 Calangute Beach",
        ],
        evening: [
          "🍤 Seafood Dinner",
        ],
      },
      {
        day: "📅 Day 2 – Heritage",
        morning: [
          "⛪ Basilica of Bom Jesus",
        ],
        afternoon: [
          "🏰 Fort Aguada",
        ],
        evening: [
          "🛍 Local Market",
        ],
      },
      {
        day: "📅 Day 3 – Adventure",
        morning: [
          "🚤 Water Sports",
        ],
        afternoon: [
          "🌴 Candolim Beach",
        ],
        evening: [
          "🎉 Beach Party",
        ],
      },
    ];
  }

  // ==========================
  // DEFAULT
  // ==========================
  else {
    itinerary = [
      {
        day: "📅 Day 1",
        morning: [
          "🏨 Check into hotel",
        ],
        afternoon: [
          "🌍 Explore the city",
        ],
        evening: [
          "🍽 Enjoy local cuisine",
        ],
      },
      {
        day: "📅 Day 2",
        morning: [
          "🏛 Visit famous attractions",
        ],
        afternoon: [
          "📸 Sightseeing",
        ],
        evening: [
          "🛍 Shopping",
        ],
      },
      {
        day: "📅 Day 3",
        morning: [
          "☕ Visit local cafés",
        ],
        afternoon: [
          "🌅 Relax and explore",
        ],
        evening: [
          "🎉 Enjoy your final day",
        ],
      },
    ];
  }

  return (
    <div className="ai-result-card">
      <h2>🤖 AI Travel Plan</h2>

      <div className="trip-info-grid">
        <div className="info-box">
          <h4>📍 Destination</h4>
          <p>{trip.destination}</p>
        </div>

        <div className="info-box">
          <h4>📅 Dates</h4>
          <p>
            {trip.startDate} - {trip.endDate}
          </p>
        </div>

        <div className="info-box">
          <h4>👥 Travelers</h4>
          <p>{trip.travelers}</p>
        </div>

        <div className="info-box">
          <h4>💰 Budget</h4>
          <p>₹{trip.budget}</p>
        </div>

        <div className="info-box">
          <h4>✈ Travel Style</h4>
          <p>{trip.travelStyle}</p>
        </div>

        <div className="info-box">
          <h4>❤️ Interests</h4>
          <p>{trip.interests.join(", ")}</p>
        </div>
      </div>

      <h2 className="itinerary-title">🗺 Suggested Itinerary</h2>

      <div className="days-grid">
        {itinerary.map((day, index) => (
          <div className="day-card" key={index}>
            <h3>{day.day}</h3>

            <h4>🌅 Morning</h4>
            <ul>
              {day.morning.map((place, i) => (
                <li key={i}>{place}</li>
              ))}
            </ul>

            <h4>🍜 Afternoon</h4>
            <ul>
              {day.afternoon.map((place, i) => (
                <li key={i}>{place}</li>
              ))}
            </ul>

            <h4>🌃 Evening</h4>
            <ul>
              {day.evening.map((place, i) => (
                <li key={i}>{place}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AITripResult;