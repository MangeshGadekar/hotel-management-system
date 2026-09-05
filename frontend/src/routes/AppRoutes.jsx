import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { lazy } from "react";

import AdminLayout from "../components/layout/AdminLayout";
import ReceptionistLayout from "../components/layout/ReceptionistLayout";

// admin
const Customers = lazy(() => import("../pages/admin/Customers"));
const Dashboard = lazy(() => import("../pages/admin/Dashboard"));
const AdminRoom = lazy(() => import("../pages/admin/Rooms"));
const Receptionists = lazy(() => import("../pages/admin/Receptionists"));
const Bookings = lazy(() => import("../pages/admin/Bookings"));
const Payments = lazy(() => import("../pages/admin/Payments"));
const Coupons = lazy(() => import("../pages/admin/Coupons"));
const Reports = lazy(() => import("../pages/admin/Reports"));
const Settings = lazy(() => import("../pages/admin/Settings"));

// Auth Pages
const Register = lazy(() => import("../pages/auth/Register"));
const Login = lazy(() => import("../pages/auth/Login"));
const ForgetPassword = lazy(() => import("../pages/auth/ForgetPassword"));
const ResetPassword = lazy(() => import("../pages/auth/ResetPassword"));

// Receptionist Pages
const ReceptionistDashboard = lazy(() => import("../pages/receptionist/Dashboard"));

// Common Pages
const RoomsAndSuits = lazy(() => import("../pages/common/RoomsAndSuits"));
const RoomBooking = lazy(() => import("../pages/common/RoomBooking"));
const RoomPage = lazy(() => import("../pages/common/RoomPage"));
const Rooms = lazy(() => import("../pages/common/Rooms"));

const Home = lazy(() => import("../pages/common/Home"));
const About = lazy(() => import("../pages/common/About"));
const Contact = lazy(() => import("../pages/common/Contact"));

const Footer = lazy(() => import("../ui/Footer"));
const Navbar = lazy(() => import("../ui/Navbar"));

export default function AppRoutes() {
  const location = useLocation();

  // Hide global Navbar/Footer on Auth, Admin, and Receptionist routes
  const hideHeaderFooter =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/receptionist") ||
    ["/login", "/register", "/forgot-password", "/reset-password"].includes(location.pathname);

  return (
    <div>
      {!hideHeaderFooter && <Navbar />}
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="rooms" element={<AdminRoom />} />
          <Route path="receptionists" element={<Receptionists />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="customers" element={<Customers />} />
          <Route path="payments" element={<Payments />} />
          <Route path="coupons" element={<Coupons />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Receptionist Routes */}
        <Route path="/receptionist" element={<ReceptionistLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ReceptionistDashboard />} />
        </Route>

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgetPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/rooms/:id" element={<RoomPage />} />
        <Route path="/booking/:id" element={<RoomBooking />} />
        <Route path="/rooms-suites" element={<RoomsAndSuits />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
      {!hideHeaderFooter && <Footer />}
    </div>
  );
}