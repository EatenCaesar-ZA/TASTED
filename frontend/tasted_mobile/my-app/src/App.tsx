/**
 * App.tsx — Root application shell
 *
 * Responsibilities:
 * - Renders the main heading and global layout
 * - Renders feature modules: RestaurantList (browse/search) and BudgetPlanner (user budgeting)
 * - Keeps components decoupled so we can add routing or tabs later without refactors
 *
 * Notes for future updates (hybrid-ready):
 * - App can be wrapped in Capacitor/Electron without changes
 * - Avoids browser-only globals beyond standard Web APIs
 */
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RestaurantList from "./components/RestaurantList"; // adjust path if needed
import BudgetPlanner from "./components/BudgetPlanner";
import RestaurantDetail from "./components/RestaurantDetail";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        <h1>🍽️ TASTED</h1>
        <p>Welcome to your restaurant reference app!</p>
        <p>Built with Django REST + React + TypeScript</p>

        <Routes>
          <Route path="/" element={<>
            <RestaurantList />
            <hr style={{ margin: '2rem 0' }} />
            <BudgetPlanner />
          </>} />
          <Route path="/restaurants/:id" element={<RestaurantDetail />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
};

export default App;