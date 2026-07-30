// Shared category configuration for the "Explore Nearby" Maps page.
// Each category maps to a real OpenStreetMap (Overpass) tag/value pair
// so results come straight from OSM data — no external photo/place APIs.

export const EXPLORE_CATEGORIES = [
  {
    id: "attractions",
    label: "Tourist Attractions",
    icon: "🏛️",
    color: "#7c3aed",
    key: "tourism",
    value: "attraction",
  },
  {
    id: "restaurants",
    label: "Restaurants",
    icon: "🍽️",
    color: "#f97316",
    key: "amenity",
    value: "restaurant",
  },
  {
    id: "hotels",
    label: "Hotels",
    icon: "🏨",
    color: "#2563eb",
    key: "tourism",
    value: "hotel",
  },
  {
    id: "cafes",
    label: "Cafes",
    icon: "☕",
    color: "#a16207",
    key: "amenity",
    value: "cafe",
  },
  {
    id: "hospitals",
    label: "Hospitals",
    icon: "🏥",
    color: "#dc2626",
    key: "amenity",
    value: "hospital",
  },
  {
    id: "airports",
    label: "Airports",
    icon: "✈️",
    color: "#0891b2",
    key: "aeroway",
    value: "aerodrome",
  },
  {
    id: "railway",
    label: "Railway Stations",
    icon: "🚉",
    color: "#16a34a",
    key: "railway",
    value: "station",
  },
  {
    id: "shopping",
    label: "Shopping Malls",
    icon: "🛍️",
    color: "#db2777",
    key: "shop",
    value: "mall",
  },
];

export const DEFAULT_CATEGORY = EXPLORE_CATEGORIES[0];