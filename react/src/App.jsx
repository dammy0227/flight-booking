import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getRedirectResult } from "firebase/auth";
import { auth } from "./firebase";
import { firebaseLogin } from "./features/users/userSlice";

import LandingPage from "./pages/user/LandingPage";
import Login from "./pages/user/Login";
import Register from "./pages/user/Register";
import LoginPage from "./pages/LoginPage";

import UserLayout from "./layout/UserLayout";
import UserDashboard from "./pages/user/UserDashboard";
import UserBookings from "./pages/user/UserBookings";
import BookingDetails from "./pages/user/BookingDetails";
import BookingView from "./pages/user/BookingView";
import PaymentView from "./pages/user/PaymentView";
import UserFlights from "./pages/user/UserFlights";
import FlightDetails from "./pages/user/FlightDetails";
import UserHotels from "./pages/user/UserHotels";
import HotelDetails from "./pages/user/HotelDetails";
import UserRooms from "./pages/user/UserRooms";
import RoomDetails from "./pages/user/RoomDetails";
import UserProfile from "./pages/user/UserProfile";

import AdminLayout from "./layout/AdminLayout";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Flights from "./pages/Flights";
import Hotels from "./pages/Hotels";
import Rooms from "./pages/Rooms";
import Bookings from "./pages/Bookings";
import Payments from "./pages/Payments";
import Settings from "./pages/Settings";

import ProtectedRoute from "./component/ProtectedRoute";

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const handleRedirectLogin = async () => {
      try {
        const result = await getRedirectResult(auth);

        if (result?.user) {
          const token = await result.user.getIdToken();
          dispatch(firebaseLogin({ token }));
        }
      } catch (err) {
        console.error("Redirect login error:", err);
      }
    };

    handleRedirectLogin();
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        {/* Public Routes - Landing page is the first page users see */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/login" element={<LoginPage />} />

        {/* User Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<UserLayout />}>
            <Route path="/user-dashboard" element={<UserDashboard />} />
            <Route path="/user-dashboard/bookings" element={<UserBookings />} />
            <Route path="/user-dashboard/bookings/:id" element={<BookingDetails />} />
            <Route path="/user-dashboard/flights" element={<UserFlights />} />
            <Route path="/user-dashboard/flights/:id" element={<FlightDetails />} />
            <Route path="/user-dashboard/hotels" element={<UserHotels />} />
            <Route path="/user-dashboard/hotels/:id" element={<HotelDetails />} />
            <Route path="/user-dashboard/rooms" element={<UserRooms />} />
            <Route path="/user-dashboard/rooms/:id" element={<RoomDetails />} />
            <Route path="/user-dashboard/profile" element={<UserProfile />} />
          </Route>
        </Route>

        {/* Booking and Payment Routes (Protected) */}
        <Route
          path="/booking"
          element={
            <ProtectedRoute>
              <BookingView />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payment"
          element={
            <ProtectedRoute>
              <PaymentView />
            </ProtectedRoute>
          }
        />

        {/* Admin Protected Routes */}
        <Route element={<ProtectedRoute adminOnly={true} />}>
          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/flights" element={<Flights />} />
            <Route path="/hotels" element={<Hotels />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Fallback - redirect any unknown routes to landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;