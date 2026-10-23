import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import useAuthStore from "../../app/useAuthStore";
import { MdFaceUnlock } from "react-icons/md";
import { FiLogIn } from "react-icons/fi";

export default function AdminLayout() {
  const token = useAuthStore((state) => state.token);

  if (!token) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-emerald-50 via-white to-emerald-100 px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 shadow-sm ring-1 ring-emerald-200">
          <MdFaceUnlock className="h-7 w-7 text-emerald-600" />
        </div>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-800">
            Please login first
          </h1>
          <p className="max-w-sm text-sm text-gray-500">
            You need to be signed in to access this page.
          </p>
        </div>
        <a
          href="/login"
          className="group inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-emerald-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 active:scale-[0.98]"
        >
          <FiLogIn className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          Go to Login
        </a>
      </div>
    );
  }

  // Filter bookings according to the active navigation menu
  const getFilteredBookings = () => {
    if (activeMenu === "Check-In Operations") {
      return bookings.filter(b => b.status === "Confirmed");
    }
    if (activeMenu === "Check-Out Operations") {
      return bookings.filter(b => b.status === "Checked-In");
    }
    return bookings;
  };

  const filteredBookings = getFilteredBookings();

  return (
    <div className="flex h-screen bg-[#F5F9F6] font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-[#FCFEFC] border-b border-emerald-100 px-8 flex items-center justify-between shadow-sm">
          <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}