import { Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";

import AdminLayout from "../components/layout/AdminLayout";
import ReceptionistLayout from "../components/layout/ReceptionistLayout";
import ReceptionistDashboard from "../pages/receptionist/ReceptionistDashboard";
import ManageBooking from "../pages/public/ManageBooking";

const Customers = lazy(() => import("../pages/admin/Customers"));
const Dashboard = lazy(() => import("../pages/admin/Dashboard"));
const AdminRoom = lazy(() => import("../pages/admin/Rooms"));
const Receptionists = lazy(() => import("../pages/admin/Receptionists"));
const Bookings = lazy(() => import("../pages/admin/Bookings"));
const Payments = lazy(() => import("../pages/admin/Payments"));
const Coupons = lazy(() => import("../pages/admin/Coupons"));
const Reports = lazy(() => import("../pages/admin/Reports"));
const Settings = lazy(() => import("../pages/admin/Settings"));
const ExtraServices = lazy(() => import("../pages/admin/ExtraServices"));
const Campaigns = lazy(() => import("../pages/admin/Campaigns"));

const Register = lazy(() => import("../pages/auth/Register"));
const Login = lazy(() => import("../pages/auth/Login"));
const ForgetPassword = lazy(() => import("../pages/auth/ForgetPassword"));
const ResetPassword = lazy(() => import("../pages/auth/ResetPassword"));

const RoomsAndSuits = lazy(() => import("../pages/common/RoomsAndSuits"));
const Room = lazy(() => import("../pages/common/Room"));
const Rooms = lazy(() => import("../pages/common/Rooms"));

const Home = lazy(() => import("../pages/common/Home"));
const About = lazy(() => import("../pages/common/About"));
const Contact = lazy(() => import("../pages/common/Contact"));

const Footer = lazy(() => import("../ui/Footer"));
const Navbar = lazy(() => import("../ui/Navbar"));

const GuestBookingPage = lazy(() => import("../pages/public/GuestBookingPage"));
const BookingSuccessPage = lazy(() => import("../pages/public/BookingSuccessPage"));



export default function AppRoutes() {
  const location = useLocation();

  const hideHeaderFooter =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/receptionist") ||
    ["/login", "/register", "/forgot-password", "/reset-password"].includes(location.pathname);

  return (
    <div>
      {!hideHeaderFooter && <Navbar />}

      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[60vh] text-slate-400 text-sm">
            Loading...
          </div>
        }
      >
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="rooms" element={<AdminRoom />} />
            <Route path="receptionists" element={<Receptionists />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="customers" element={<Customers />} />
            <Route path="payments" element={<Payments />} />
            <Route path="extra-services" element={<ExtraServices />} />
            <Route path="coupons" element={<Coupons />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="campaigns" element={<Campaigns />} />
          </Route>

          {/* Receptionist Routes */}
          <Route path="/receptionist" element={<ReceptionistLayout />}>
            <Route index element={<ReceptionistDashboard />} />
            <Route path="dashboard" element={<ReceptionistDashboard />} />
            <Route path="rooms" element={<AdminRoom />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="customers" element={<Customers />} />
            <Route path="payments" element={<Payments />} />
            <Route path="coupons" element={<Coupons />} />
          </Route>

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgetPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/rooms/:roomNumber" element={<Room />} />
          <Route path="/rooms-suites" element={<RoomsAndSuits />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        
<Route path="/booking/success" element={<BookingSuccessPage />} />
<Route path="/manage-booking" element={<ManageBooking />} />

          {/* Guest Direct Online Booking */}
          <Route path="/booking/:roomNumber" element={<GuestBookingPage />} />
        </Routes>
      </Suspense>

      {!hideHeaderFooter && <Footer />}
    </div>
  );
}