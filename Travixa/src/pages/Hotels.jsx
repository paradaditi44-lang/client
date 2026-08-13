import React, { useMemo, useState } from "react";
import HotelCard from "../components/HotelCard";
import Footer from "../components/Footer";
import "../styles/Hotels.css";

// Robust, non-aggressive normalization for local hotel image matching
function normalizeHotelName(name = "") {
  return String(name)
    .toLowerCase()
    .trim()
    .replace(/[&\-\'\,\.\,\;\:\|\/\\]/g, " ")
    .replace(/\s+/g, " ");
}

// Alias registry mapping normalized variation strings to canonical hotel map keys
const HOTEL_IMAGE_ALIASES = {
  "the ssk solitaire boutique hotel": "the ssk solitaire",
  "hotel durga fast food veg restaurant": "hotel durga",
  "hi 5 hotel and experience": "hi 5 hotel",
  "hotel grand ashwin nx": "hotel grand ashwin",
  "gateway hotel": "the gateway hotel",
  "courtyard by marriott": "courtyard",
};

// Local curated hotel image registry
const HOTEL_IMAGE_MAP = {
  "hotel rahi": "/hotel-images/hotel-rahi.jpg",
  "alwin row house": "/hotel-images/alwin-row-house.jpg",
  "panchvati hotel": "/hotel-images/panchvati-hotel.jpg",
  "ginger": "/hotel-images/ginger-hotel-nashik.jpg",
  "shiv shakti annex": "/hotel-images/shiv-shakti-annex.jpg",
  "hotel grand ashwin": "/hotel-images/hotel-grand-ashwin.jpg",
  "hotel gurukrupa": "/hotel-images/hotel-gurukrupa.jpg",
  "the utsav": "/hotel-images/the-utsav.jpg",
  "hotel seven heaven": "/hotel-images/hotel-seven-heaven.jpg",
  "hotel saptashrungi lodging": "/hotel-images/hotel-saptashrungi-lodging.jpg",
  "majithia villa": "/hotel-images/majithia-villa.jpg",
  "hotel durga": "/hotel-images/hotel-durga.jpg",
  "the ssk solitaire": "/hotel-images/the-ssk-solitaire.jpg",
  "hotel sri jai palace": "/hotel-images/hotel-sri-jai-palace.jpg",
  "shivsagar hotel": "/hotel-images/shivsagar-hotel.jpg",
  "hotel skylark inn": "/hotel-images/hotel-skylark-inn.jpg",
  "hi 5 hotel": "/hotel-images/hi-5-hotel.jpg",
  "courtyard": "/hotel-images/courtyard-nashik.jpg",
  "hotel dwarka": "/hotel-images/hotel-dwarka.jpg",
  "hotel chandralok": "/hotel-images/hotel-chandralok.jpg",
  "grand rio": "/hotel-images/grand-rio-nashik.jpg",
  "the gateway hotel": "/hotel-images/the-gateway-hotel-nashik.jpg",
  "hotel omkar": "/hotel-images/hotel-omkar.jpg",
  "hotel kashish palace": "/hotel-images/hotel-kashish-palace.jpg",
};

function getCuratedHotelPhoto(name = "") {
  const normalized = normalizeHotelName(name);
  const targetKey = HOTEL_IMAGE_ALIASES[normalized] || normalized;
  return HOTEL_IMAGE_MAP[targetKey] || null;
}

// Deterministic metadata generators based strictly on hotel name
function generateDeterministicPrice(name = "") {
  let hash = 0;
  const str = String(name).trim().toLowerCase();
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const absHash = Math.abs(hash);
  const bucket = absHash % 10;
  if (bucket < 4) {
    // Budget range: ₹1500–₹2500
    return 1500 + ((absHash % 21) * 50);
  } else if (bucket < 8) {
    // Mid-range: ₹2600–₹5000
    return 2600 + ((absHash % 25) * 100);
  } else {
    // Luxury range: ₹5200–₹9500
    return 5200 + ((absHash % 44) * 100);
  }
}

function generateDeterministicAmenities(name = "") {
  let hash = 0;
  const str = String(name).trim().toLowerCase();
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const absHash = Math.abs(hash);
  const amenitySubsets = [
    ["WiFi", "Breakfast"],
    ["Pool", "WiFi", "Parking"],
    ["WiFi", "Parking"],
    ["Pool", "Breakfast"],
    ["Breakfast", "Parking"],
    ["Pool", "WiFi"],
    ["WiFi"],
    ["Pool", "Breakfast", "Parking"],
    ["Breakfast"],
    ["Pool", "WiFi", "Breakfast", "Parking"],
    ["Parking"],
    ["WiFi", "Breakfast", "Parking"],
  ];
  return amenitySubsets[absHash % amenitySubsets.length];
}

function Hotels() {
  const [search, setSearch] = useState("");
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchedLocation, setSearchedLocation] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // Filter states
  const [selectedRating, setSelectedRating] = useState("All");
  const [selectedAmenity, setSelectedAmenity] = useState("");
  const [selectedBudgetFilter, setSelectedBudgetFilter] = useState("All");

  const GEOAPIFY_KEY =
    import.meta.env?.VITE_GEOAPIFY_API_KEY || "21be2c66503444a1a04fc355b92e97e5";

  const searchHotels = async () => {
    if (!search.trim()) return;

    setLoading(true);
    setHasSearched(true);
    setSearchedLocation(search.trim());

    // WORLDWIDE GEOAPIFY + VENUE SEARCH (Primary Hotel Source)
    try {
      const geoResponse = await fetch(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
          search.trim()
        )}&apiKey=${GEOAPIFY_KEY}`
      );

      const geoData = await geoResponse.json();

      if (!geoData.features || geoData.features.length === 0) {
        setHotels([]);
        setLoading(false);
        return;
      }

      const [lon, lat] = geoData.features[0].geometry.coordinates;

      const hotelResponse = await fetch(
        `https://api.geoapify.com/v2/places?categories=accommodation.hotel&filter=circle:${lon},${lat},10000&limit=24&apiKey=${GEOAPIFY_KEY}`
      );

      const hotelData = await hotelResponse.json();

      if (hotelData.features && hotelData.features.length > 0) {
        const formattedHotels = hotelData.features.map((item, idx) => {
          const props = item.properties || {};
          const name = props.name || props.address_line1 || `Hotel in ${search.trim()}`;
          const address =
            props.formatted ||
            `${props.street || ""} ${props.city || search.trim()}`.trim();
          const ratingVal = (4.0 + (idx % 10) * 0.1).toFixed(1);
          const reviewCount = Math.floor(120 + (idx * 37) % 850);

          // Deterministic local image & alias mapping
          const photoUrl = getCuratedHotelPhoto(name);

          return {
            id: props.place_id || idx,
            name: name,
            location: address || "Address unavailable",
            rating: ratingVal,
            userRatingsTotal: reviewCount,
            price: generateDeterministicPrice(name),
            amenities: generateDeterministicAmenities(name),
            photoUrl: photoUrl,
            website:
              props.website ||
              `https://www.google.com/search?q=${encodeURIComponent(
                name + " " + address
              )}`,
            mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              name + " " + address
            )}`,
          };
        });

        setHotels(formattedHotels);
      } else {
        setHotels([]);
      }
    } catch (error) {
      console.error("Hotel Search Error:", error);
      setHotels([]);
    }

    setLoading(false);
  };

  // Filter hotels based on selected chips (cumulative filtering)
  const filteredHotels = useMemo(() => {
    return hotels.filter((h) => {
      // Rating filter
      if (selectedRating === "4.0+" && parseFloat(h.rating) < 4.0) return false;
      if (selectedRating === "4.5+" && parseFloat(h.rating) < 4.5) return false;

      // Budget filter
      if (selectedBudgetFilter === "₹ Budget" && h.price > 3000) return false;
      if (selectedBudgetFilter === "₹₹ Luxury" && h.price <= 3000) return false;

      // Amenity filter
      if (selectedAmenity) {
        const cleanAmenity = selectedAmenity.split(" ")[0]; // Extracts "Pool", "WiFi", "Breakfast", "Parking"
        if (!h.amenities || !h.amenities.includes(cleanAmenity)) return false;
      }

      return true;
    });
  }, [hotels, selectedRating, selectedAmenity, selectedBudgetFilter]);

  // Derived search statistics for the stats bar
  const stats = useMemo(() => {
    if (!filteredHotels.length) return null;
    const avgRating =
      filteredHotels.reduce((sum, h) => sum + parseFloat(h.rating || 0), 0) /
      filteredHotels.length;
    const topRated = filteredHotels.reduce(
      (best, h) =>
        parseFloat(h.rating || 0) > parseFloat(best?.rating || 0) ? h : best,
      filteredHotels[0]
    );
    return {
      count: filteredHotels.length,
      avgRating: avgRating.toFixed(1),
      topRated: topRated?.name || "—",
    };
  }, [filteredHotels]);

  return (
    <div className="hotels-root">
      <main className="hotels-wrapper">
        {/* Compact Hero Section */}
        <section className="hotels-hero-compact">
          <span className="hero-badge">🏨 CURATED STAYS</span>
          <h1>Find Your Perfect Stay 🏨</h1>
          <p>Discover the best hotels for your next adventure.</p>
        </section>

        {/* Search & Filters Bar */}
        <section className="search-filter-card">
          <div className="search-input-group">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search hotel name, city, district, state, or country..."
              className="hotel-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") searchHotels();
              }}
            />
            {search && (
              <button
                className="clear-search-btn"
                onClick={() => setSearch("")}
                title="Clear"
              >
                ✕
              </button>
            )}
            <button className="btn-search-primary" onClick={searchHotels}>
              Search Stays
            </button>
          </div>

          {/* Filter Chips Bar */}
          <div className="filter-chips-bar">
            <span className="filter-title">Filter by:</span>

            {/* Rating Filter Chips */}
            <div className="filter-group">
              <span className="filter-group-label">Rating:</span>
              {["All", "4.0+", "4.5+"].map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`chip-btn ${selectedRating === r ? "active" : ""}`}
                  onClick={() => setSelectedRating(r)}
                >
                  ⭐ {r}
                </button>
              ))}
            </div>

            {/* Amenities Filter Chips */}
            <div className="filter-group">
              <span className="filter-group-label">Amenities:</span>
              {["Pool 🏊", "WiFi 📶", "Breakfast 🍽️", "Parking 🚗"].map((a) => (
                <button
                  key={a}
                  type="button"
                  className={`chip-btn ${selectedAmenity === a ? "active" : ""}`}
                  onClick={() =>
                    setSelectedAmenity(selectedAmenity === a ? "" : a)
                  }
                >
                  {a}
                </button>
              ))}
            </div>

            {/* Budget Filter Chips */}
            <div className="filter-group">
              <span className="filter-group-label">Budget:</span>
              {["All", "₹ Budget", "₹₹ Luxury"].map((b) => (
                <button
                  key={b}
                  type="button"
                  className={`chip-btn ${selectedBudgetFilter === b ? "active" : ""}`}
                  onClick={() => setSelectedBudgetFilter(b)}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Summary Bar */}
        {!loading && stats && (
          <div className="search-stats-bar">
            <div className="stat-pill">
              <span className="stat-value">{stats.count}</span>
              <span className="stat-label">Hotels Found</span>
            </div>
            <div className="stat-pill">
              <span className="stat-value">⭐ {stats.avgRating}</span>
              <span className="stat-label">Avg. Rating</span>
            </div>
            <div className="stat-pill stat-pill-wide">
              <span className="stat-value stat-value-name" title={stats.topRated}>
                {stats.topRated}
              </span>
              <span className="stat-label">Top Rated</span>
            </div>
            <div className="stat-pill">
              <span
                className="stat-value stat-value-name"
                title={searchedLocation}
              >
                {searchedLocation}
              </span>
              <span className="stat-label">Location</span>
            </div>
          </div>
        )}

        {/* Hotel Cards Grid & Loading / Empty States */}
        <div className="hotel-grid-wrapper">
          {/* Loading Skeleton Cards */}
          {loading && (
            <div className="hotel-skeleton-grid">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="hotel-skeleton-card">
                  <div className="skeleton-image-shimmer"></div>
                  <div className="skeleton-body">
                    <div className="skeleton-line line-title"></div>
                    <div className="skeleton-line line-sub"></div>
                    <div className="skeleton-chips">
                      <div className="skeleton-chip"></div>
                      <div className="skeleton-chip"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Render Hotels List */}
          {!loading &&
            filteredHotels.map((hotel) => (
              <HotelCard
                key={hotel.id}
                name={hotel.name}
                location={hotel.location}
                rating={hotel.rating}
                userRatingsTotal={hotel.userRatingsTotal}
                price={hotel.price}
                amenities={hotel.amenities}
                photoUrl={hotel.photoUrl}
                website={hotel.website}
                mapsUrl={hotel.mapsUrl}
              />
            ))}

          {/* Empty State: No Hotels Found */}
          {!loading && hasSearched && filteredHotels.length === 0 && (
            <div className="hotels-empty-card">
              <div className="empty-icon">🏨</div>
              <h2>No Hotels Found</h2>
              <p>
                We couldn't find any matching hotels for{" "}
                <strong>"{searchedLocation}"</strong>.
                <br />
                Try searching another city, state, or popular destination!
              </p>
              <div className="empty-suggestions-list">
                <span className="chip-suggest" onClick={() => { setSearch("Mumbai"); searchHotels(); }}>
                  Mumbai
                </span>
                <span className="chip-suggest" onClick={() => { setSearch("Goa"); searchHotels(); }}>
                  Goa
                </span>
                <span className="chip-suggest" onClick={() => { setSearch("Paris"); searchHotels(); }}>
                  Paris
                </span>
                <span className="chip-suggest" onClick={() => { setSearch("Dubai"); searchHotels(); }}>
                  Dubai
                </span>
                <span className="chip-suggest" onClick={() => { setSearch("Tokyo"); searchHotels(); }}>
                  Tokyo
                </span>
              </div>
            </div>
          )}

          {/* Empty State: Start Search */}
          {!loading && !hasSearched && (
            <div className="hotels-empty-card">
              <div className="empty-icon">🔍</div>
              <h2>Start Your Hotel Search</h2>
              <p>
                Enter a city, district, state, or hotel name above to discover the best accommodations worldwide.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Hotels;