import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAuthStore from "../../app/useAuthStore";
import { adminDashboard, fetchAllBooking } from "../../apis/api";
import {
  HiOutlineCurrencyRupee,
  HiOutlineCalendar,
  HiOutlineKey,
  HiOutlineSparkles,
  HiOutlineUserGroup,
  HiOutlineExclamationCircle,
  HiOutlineClock,
  HiOutlineHome,
  HiOutlineArrowUpRight,
} from "react-icons/hi2";

const formatINR = (n = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

const getStatusBadge = (status = "") => {
  const norm = String(status).toUpperCase();
  switch (norm) {
    case "CHECKED_IN":
      return "bg-emerald-50 text-emerald-700 border-emerald-200/80 ring-1 ring-emerald-500/20";
    case "CHECKED_OUT":
      return "bg-slate-100 text-slate-700 border-slate-200";
    case "CONFIRMED":
      return "bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-500/20";
    case "CANCELLED":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "PENDING":
    default:
      return "bg-amber-50 text-amber-700 border-amber-200";
  }
};

export default function Dashboard() {
  const token = useAuthStore((state) => state.token);

  const [data, setData] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revenueFilter, setRevenueFilter] = useState("This Month");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const [dashRes, bookingsRes] = await Promise.allSettled([
          adminDashboard(token),
          fetchAllBooking(token),
        ]);

        if (cancelled) return;

        if (dashRes.status === "fulfilled") {
          setData(dashRes.value);
        } else {
          throw dashRes.reason;
        }

        if (bookingsRes.status === "fulfilled" && Array.isArray(bookingsRes.value)) {
          const sorted = [...bookingsRes.value]
            .sort((a, b) => (b.id || 0) - (a.id || 0))
            .slice(0, 6);
          setRecentBookings(sorted);
        }
      } catch (err) {
        if (!cancelled) setError(err);
        console.error("Dashboard data fetch failed:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-slate-500 font-medium">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-amber-200 border-t-[#D96B43] mb-4"></div>
        <p className="text-sm tracking-wide">Loading hotel analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700">
        <div className="font-semibold text-base mb-1">Failed to connect to Dashboard</div>
        <div className="text-xs text-rose-500">Ensure the Spring Boot backend is active on port 8080.</div>
      </div>
    );
  }

  if (!data) return null;

  const {
    totalRevenue = 0,
    totalBookings = 0,
    occupiedRooms = 0,
    availableRooms = 0,
    totalRooms = 0,
    totalCustomers = 0,
    reservedRooms = 0,
    maintenanceRooms = 0,
    totalPendingAmount = 0,
    todayBookings = 0,
    todayRevenue = 0,
    monthlyRevenue = 0,
  } = data;

  const occupancyPct =
    totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  const gaugeStyle = {
    background: `conic-gradient(#D96B43 0% ${occupancyPct}%, #e2e8f0 ${occupancyPct}% 100%)`,
  };

  return (
    <div className="space-y-7 pb-10">
      {/* 1. Primary Highlight KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="relative overflow-hidden bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shadow-inner">
              <HiOutlineCurrencyRupee />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {formatINR(totalRevenue)}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-600">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live portfolio earnings
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none"></div>
        </div>

        {/* Total Bookings */}
        <div className="relative overflow-hidden bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Bookings
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl shadow-inner">
              <HiOutlineCalendar />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {totalBookings}
            </div>
            <div className="mt-2 text-xs font-medium text-slate-500">
              All-time reservations
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none"></div>
        </div>

        {/* Occupied Rooms */}
        <div className="relative overflow-hidden bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Occupied Rooms
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#D96B43] flex items-center justify-center text-xl shadow-inner">
              <HiOutlineKey />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {occupiedRooms}{" "}
              <span className="text-sm font-normal text-slate-400">/ {totalRooms}</span>
            </div>
            <div className="mt-2 text-xs font-medium text-amber-700">
              {occupancyPct}% of inventory active
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none"></div>
        </div>

        {/* Available Rooms */}
        <div className="relative overflow-hidden bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Available Rooms
            </span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center text-xl shadow-inner">
              <HiOutlineSparkles />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {availableRooms}
            </div>
            <div className="mt-2 text-xs font-medium text-teal-700">
              Ready for immediate check-in
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-teal-500/5 rounded-full blur-xl pointer-events-none"></div>
        </div>
      </div>

      {/* 2. Visual Analytics & Occupancy Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Overview */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Revenue Performance</h3>
              <p className="text-xs text-slate-400 mt-0.5">Real-time revenue growth trajectory</p>
            </div>
            <select
              value={revenueFilter}
              onChange={(e) => setRevenueFilter(e.target.value)}
              className="text-xs font-semibold border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#D96B43]/30"
            >
              <option>This Week</option>
              <option>This Month</option>
            </select>
          </div>

          {/* SVG Interactive Chart */}
          <div className="h-52 w-full bg-gradient-to-b from-amber-50/30 to-slate-50/60 rounded-xl border border-slate-100 p-4 flex flex-col justify-between relative overflow-hidden">
            <div className="flex justify-between text-[11px] font-semibold text-slate-400 border-b border-slate-100 pb-2">
              <span>GROWTH TRENDLINE</span>
              <span className="text-[#D96B43]">{formatINR(monthlyRevenue)} Cycle Total</span>
            </div>

            <svg className="w-full h-32 overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D96B43" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#D96B43" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Subtle Horizontal grid lines */}
              <line x1="0" y1="30" x2="500" y2="30" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="70" x2="500" y2="70" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="110" x2="500" y2="110" stroke="#f1f5f9" strokeWidth="1" />

              <path
                d="M 0 100 Q 120 85, 220 60 T 360 40 T 500 15 L 500 120 L 0 120 Z"
                fill="url(#areaGradient)"
              />
              <path
                d="M 0 100 Q 120 85, 220 60 T 360 40 T 500 15"
                fill="none"
                stroke="#D96B43"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <circle cx="500" cy="15" r="5" fill="#D96B43" className="animate-pulse" />
            </svg>

            <div className="flex justify-between text-[10px] font-medium text-slate-400 pt-1">
              <span>Week 1</span>
              <span>Week 2</span>
              <span>Week 3</span>
              <span>Week 4 (Current)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-5 pt-4 border-t border-slate-100">
            <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-500 font-medium">Today's Revenue</p>
              <p className="text-xl font-bold text-slate-800 mt-0.5">{formatINR(todayRevenue)}</p>
            </div>
            <div className="bg-amber-50/40 p-3.5 rounded-xl border border-amber-100/60">
              <p className="text-xs text-[#D96B43] font-medium">This Month</p>
              <p className="text-xl font-bold text-slate-800 mt-0.5">{formatINR(monthlyRevenue)}</p>
            </div>
          </div>
        </div>

        {/* Room Occupancy Gauge Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-slate-800">Room Occupancy</h3>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-[#D96B43] border border-amber-200">
                Live Status
              </span>
            </div>
            <p className="text-xs text-slate-400">Inventory allocation metrics</p>
          </div>

          <div className="relative flex items-center justify-center my-4">
            <div
              className="w-44 h-44 rounded-full flex items-center justify-center transition-all duration-700 shadow-inner"
              style={gaugeStyle}
            >
              <div className="w-32 h-32 rounded-full bg-white flex flex-col items-center justify-center shadow-md">
                <span className="text-3xl font-black text-slate-800 tracking-tight">
                  {occupancyPct}%
                </span>
                <span className="text-[11px] font-bold text-[#D96B43] uppercase tracking-wider mt-0.5">
                  Occupied
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs font-medium text-slate-600">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D96B43]"></span>
                Occupied
              </span>
              <span className="font-bold text-slate-800">{occupiedRooms} Rooms</span>
            </div>
            <div className="flex items-center justify-between text-xs font-medium text-slate-600">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                Available
              </span>
              <span className="font-bold text-slate-800">{availableRooms} Rooms</span>
            </div>
            <div className="flex items-center justify-between text-xs font-medium text-slate-600">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                Reserved
              </span>
              <span className="font-bold text-slate-800">{reservedRooms} Rooms</span>
            </div>
            <div className="flex items-center justify-between text-xs font-medium text-slate-600">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                Maintenance
              </span>
              <span className="font-bold text-slate-800">{maintenanceRooms} Rooms</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Secondary Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Customers</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{totalCustomers}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl">
            <HiOutlineUserGroup />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Today's Bookings</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{todayBookings}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
            <HiOutlineClock />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Total Rooms</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{totalRooms}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center text-xl">
            <HiOutlineHome />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Pending Due</p>
            <p className="text-2xl font-black text-rose-600 mt-1">{formatINR(totalPendingAmount)}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl">
            <HiOutlineExclamationCircle />
          </div>
        </div>
      </div>

      {/* 4. Enriched Recent Bookings Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-5 sm:px-6 border-b border-slate-200/80 flex items-center justify-between bg-gradient-to-r from-white to-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-800">Recent Bookings & Activity</h3>
            <p className="text-xs text-slate-400 mt-0.5">Latest guests with room assignments & settlement status</p>
          </div>
          <Link
            to="/admin/bookings"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D96B43] bg-amber-50 hover:bg-amber-100/80 px-3 py-1.5 rounded-lg transition-colors"
          >
            All Bookings <HiOutlineArrowUpRight className="text-sm" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 text-slate-500 font-bold text-[11px] uppercase tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="px-6 py-3.5">Booking ID</th>
                <th className="px-6 py-3.5">Guest</th>
                <th className="px-6 py-3.5">Room</th>
                <th className="px-6 py-3.5">Stay Dates</th>
                <th className="px-6 py-3.5">Total Amount</th>
                <th className="px-6 py-3.5">Payment</th>
                <th className="px-6 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentBookings.length > 0 ? (
                recentBookings.map((b) => {
                  const guestName =
                    b.guest?.name ||
                    b.guestName ||
                    (b.guest?.firstName ? `${b.guest.firstName} ${b.guest.lastName || ""}` : "Guest");
                  
                  const roomNum = b.roomNumber || b.room?.roomNumber || "—";
                  const roomType = b.roomType || b.room?.roomType || "DELUXE";
                  const total = b.totalAmount || b.amount || b.finalAmount || 0;
                  const balance = Number(b.balanceAmount ?? b.pendingAmount ?? 0);
                  const isFullyPaid = balance <= 0;

                  return (
                    <tr key={b.id} className="hover:bg-amber-50/30 transition-colors">
                      <td className="px-6 py-4 font-extrabold text-slate-800">
                        #{b.id}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">{guestName}</div>
                        <div className="text-[11px] text-slate-400">{b.guest?.email || b.email || "No email"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-700">{roomNum}</span>
                          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {roomType}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-500">
                        <div>{b.checkInDate || b.checkIn || "—"}</div>
                        <div className="text-slate-400 text-[11px]">to {b.checkOutDate || b.checkOut || "—"}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800">
                        {formatINR(total)}
                      </td>
                      <td className="px-6 py-4">
                        {isFullyPaid ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            Fully Paid
                          </span>
                        ) : (
                          <div className="inline-flex flex-col text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            <span>Due: {formatINR(balance)}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2.5 py-1 text-xs font-bold rounded-lg border ${getStatusBadge(
                            b.bookingStatus || b.status
                          )}`}
                        >
                          {b.bookingStatus || b.status || "CONFIRMED"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-400 text-xs">
                    No recent booking activity recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}