import React, { useEffect, useState } from "react";
import axios from "axios";

// Type definition for a restaurant object returned by the API
type Restaurant = {
  id: number;
  name: string;
  location: string;
  price_range: string;
  genre: string;
  image_url?: string; // optional image URL
};

const RestaurantList: React.FC = () => {
  // State to store fetched restaurant data
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  // State for search and filter inputs
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [genreFilter, setGenreFilter] = useState("");

  // State for loading and error feedback
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch restaurant data from the Django REST API when component mounts
  useEffect(() => {
    axios.get("http://localhost:8000/api/restaurants/")
      .then((res: { data: Restaurant[] }) => {
        setRestaurants(res.data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        console.error(err);
        setError("Failed to load restaurants.");
        setLoading(false);
      });
  }, []);

  // Extract unique locations and genres from the data for dropdown filters
  const locations = [...new Set(restaurants.map(r => r.location))];
  const genres = [...new Set(restaurants.map(r => r.genre))];

  // Apply search and filters to the restaurant list
  const filteredRestaurants = restaurants.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) && // match search text
    (locationFilter ? r.location === locationFilter : true) && // match location if selected
    (priceFilter ? r.price_range === priceFilter : true) && // match price range
    (genreFilter ? r.genre === genreFilter : true) // match genre
  );

  return (
    <div>
      <h2>Restaurants</h2>

      {/* Show loading spinner or error message if needed */}
      {loading && <p>Loading restaurants...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Filter form with accessible labels */}
      <form style={{ marginBottom: "1rem" }}>
        {/* Search input */}
        <label>
          Search:
          <input
            type="text"
            placeholder="Search restaurants..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ marginLeft: "0.5rem" }}
          />
        </label>

        {/* Location dropdown */}
        <label style={{ marginLeft: "1rem" }}>
          Location:
          <select value={locationFilter} onChange={e => setLocationFilter(e.target.value)}>
            <option value="">All Locations</option>
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </label>

        {/* Price dropdown */}
        <label style={{ marginLeft: "1rem" }}>
          Price:
          <select value={priceFilter} onChange={e => setPriceFilter(e.target.value)}>
            <option value="">All Prices</option>
            <option value="$">$</option>
            <option value="$$">$$</option>
            <option value="$$$">$$$</option>
          </select>
        </label>

        {/* Genre dropdown */}
        <label style={{ marginLeft: "1rem" }}>
          Genre:
          <select value={genreFilter} onChange={e => setGenreFilter(e.target.value)}>
            <option value="">All Genres</option>
            {genres.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </label>
      </form>

      {/* Render the filtered list of restaurants */}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {filteredRestaurants.map(r => (
          <li key={r.id} style={{ marginBottom: "1rem", display: "flex", alignItems: "center" }}>
            {/* Show restaurant image or fallback if missing */}
            <img
              src={r.image_url || "/default-restaurant.jpg"} // fallback image from public folder
              alt={r.name}
              width={50}
              height={50}
              style={{ marginRight: "1rem", objectFit: "cover", borderRadius: "4px" }}
            />
            {/* Restaurant details */}
            <div>
              <strong>{r.name}</strong> — {r.genre} — {r.location} — {r.price_range}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RestaurantList;