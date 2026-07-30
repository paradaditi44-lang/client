import { useEffect, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";

function HotelList({ destination }) {
  const [hotels, setHotels] = useState([]);

  useEffect(() => {
    if (!destination) return;

    const loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      libraries: ["places"],
    });

    loader.load().then(() => {
      const service = new window.google.maps.places.PlacesService(
        document.createElement("div")
      );

      const request = {
        query: `hotels in ${destination}`,
        fields: [
          "name",
          "rating",
          "formatted_address",
          "photos",
          "user_ratings_total",
        ],
      };

      service.textSearch(request, (results, status) => {
        if (status === "OK") {
          setHotels(results);
        }
      });
    });
  }, [destination]);


  return (
    <div>
      <h2>🏨 Hotels in {destination}</h2>

      {hotels.map((hotel, index) => (
        <div key={index}>
          <h3>{hotel.name}</h3>
          <p>⭐ {hotel.rating || "No rating"}</p>
          <p>{hotel.formatted_address}</p>
        </div>
      ))}
    </div>
  );
}

export default HotelList;