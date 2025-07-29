import React from "react";
import RestaurantList from "./components/RestaurantList"; // adjust path if needed

const App: React.FC = () => {
  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>🍽️ TASTED</h1>
      <p>Welcome to your restaurant reference app!</p>
      <p>Built with Django REST + React + TypeScript</p>

      {/* Render the restaurant list */}
      <RestaurantList />
    </main>
  );
};

export default App;