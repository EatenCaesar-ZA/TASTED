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
import RestaurantDetail from "./components/RestaurantDetail";
import ThemeSwitcher from "./components/ThemeSwitcher";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        <div className="card" style={{ padding: '1rem', marginBottom: '1rem' }}>
          <h1 style={{ color: 'var(--primary)', margin: 0 }}>🍽️ TASTED</h1>
          <p style={{ margin: '0.25rem 0 0 0' }}>Welcome to your restaurant reference app!</p>
          <p style={{ margin: 0, color: 'var(--muted)' }}>Built with Django REST + React + TypeScript</p>
        </div>

        <div className="card" style={{ margin: '1rem 0', padding: '0.75rem' }}>
          <ThemeSwitcher />
        </div>

        <Routes>
          <Route path="/" element={<RestaurantList />} />
          <Route path="/restaurants/:id" element={<RestaurantDetail />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
};

export default App;