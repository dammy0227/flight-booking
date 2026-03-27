import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Flights from "./pages/Flights";

import ProtectedRoute from "./component/ProtectedRoute";
import AdminLayout from "./layout/AdminLayout";
import Hotels from "./pages/Hotels";
import Rooms from "./pages/Rooms";
import Bookings from "./pages/Bookings";
import Payments from "./pages/Payments";
import Settings from "./pages/Settings";

const App = () => {
  return (
    <Router>
      <Routes>

        {/* Login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Admin Layout */}
        <Route
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/flights" element={<Flights />} />
          <Route path="/hotels" element={<Hotels />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/settings" element={<Settings />} />

        </Route>

        <Route path="/" element={<Navigate to="/login" />} />

      </Routes>
    </Router>
  );
};

export default App;