import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StatCard from "../../components/common/StatCard";
import useAuthStore from "../../app/useAuthStore";
import { adminDashboard } from "../../apis/api";

const formatINR = (n = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

export default function Dashboard() {
  const token = useAuthStore((state) => state.token);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const res = await adminDashboard(token);
        if (!cancelled) setData(res);
      } catch (err) {
        if (!cancelled) setError(err);
        console.error("dashboard fetch failed", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (loading) return <div className="p-6 text-slate-500">Loading dashboard…</div>;
  if (error)   return <div className="p-6 text-red-600">Failed to load dashboard.</div>;
  if (!data)   return null;

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

  const stats = [
    { title: "Total Revenue",   value: formatINR(totalRevenue) },
    { title: "Total Bookings",  value: totalBookings },
    { title: "Occupied Rooms",  value: occupiedRooms },
    { title: "Available Rooms", value: availableRooms },
  ];

  // occupancy % — guard against divide-by-zero
  const occupancyPct =
    totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  // conic-gradient gauge instead of the hardcoded 56% arc
  const gaugeStyle = {
    background: `conic-gradient(#D96B43 0% ${occupancyPct}%, #f1f5f9 ${occupancyPct}% 100%)`,
  };

  return (
    <div className="space-y-6">
      {/* 1. Top KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      {/* 2. Visual Graphs Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-800">Revenue Overview</h3>
            <select className="text-xs border border-slate-200 rounded-md px-2 py-1 text-slate-600 focus:outline-none">
              <option>This Week</option>
              <option>This Month</option>
            </select>
          </div>
          <div className="h-48 bg-slate-50 rounded-lg border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-sm">
            [ Line Chart: Revenue Trends ]
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
            <div>
              <p className="text-slate-500">Today's Revenue</p>
              <p className="font-semibold text-slate-800">{formatINR(todayRevenue)}</p>
            </div>
            <div>
              <p className="text-slate-500">This Month</p>
              <p className="font-semibold text-slate-800">{formatINR(monthlyRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-between">
          <h3 className="text-base font-bold text-slate-800 w-full text-left mb-4">
            Room Occupancy
          </h3>
          <div className="relative flex items-center justify-center my-4">
            <div
              className="w-36 h-36 rounded-full flex items-center justify-center"
              style={gaugeStyle}
            >
              <div className="w-28 h-28 rounded-full bg-white flex items-center justify-center">
                <span className="text-2xl font-bold text-slate-800">
                  {occupancyPct}%
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-slate-500 mt-2 justify-center">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D96B43]" />
              Occupied ({occupiedRooms})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
              Available ({availableRooms})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-300" />
              Reserved ({reservedRooms})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-300" />
              Maintenance ({maintenanceRooms})
            </span>
          </div>
        </div>
      </div>

      {/* 3. Secondary KPI strip — extra API fields worth showing */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total Customers"  value={totalCustomers} />
        <StatCard title="Today's Bookings" value={todayBookings} />
        <StatCard title="Total Rooms"      value={totalRooms} />
        <StatCard title="Pending Amount"   value={formatINR(totalPendingAmount)} />
      </div>

      {/* 4. Recent Bookings — still hardcoded until you add an endpoint */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800">Recent Bookings</h3>
          <Link
            to="/admin/bookings"
            className="text-xs font-semibold text-[#D96B43] hover:underline"
          >
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Booking ID</th>
                <th className="px-6 py-3">Guest Name</th>
                <th className="px-6 py-3">Check-in</th>
                <th className="px-6 py-3">Check-out</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* replace with real data when /admin/recent-bookings exists */}
              <tr>
                <td colSpan={6} className="px-6 py-6 text-center text-slate-400 text-xs">
                  No recent bookings endpoint wired up yet
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}