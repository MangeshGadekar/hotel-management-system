import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import StatCard from "../../components/common/StatCard";
import useAuthStore from "../../app/useAuthStore";
import useBookingStore from "../../app/useBookingStore";
import useGuestStore from "../../app/useGuestStore";
import useRoomStore from "../../app/useRoomStore";
// import { adminDashboard } from "../../api/..."; // restore your API import

const formatINR = (n = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

const STATUS_STYLES = {
  Confirmed: "bg-emerald-50 text-emerald-600",
  "Checked-In": "bg-blue-50 text-blue-600",
  "Checked-Out": "bg-slate-100 text-slate-500",
};

const DEFAULT_STATUS_STYLE = "bg-slate-100 text-slate-500";

const TABS = [
  { id: "arrivals", label: "Arrivals" },
  { id: "departures", label: "Departures" },
  { id: "checked_in", label: "Checked-In" },
  { id: "requests", label: "Requests" },
];

const STATUS_FILTER = {
  arrivals: "Confirmed",
  departures: "Checked-In",
  checked_in: "Checked-In",
};

export default function ReceptionistDashboard() {
  // --- Stores (use selectors, never call store methods in the render body) ---
  const token = useAuthStore((s) => s.token);
  const bookingCount = useBookingStore((s) => s.bookings?.length ?? 0);
  const guestCount = useGuestStore((s) => s.guests?.length ?? 0);
  const roomCount = useRoomStore((s) => s.rooms?.length ?? 0);

  // --- Layout context (guard against undefined) ---
  const ctx = useOutletContext() ?? {};
  const bookings = ctx.bookings ?? [];
  const requests = ctx.requests ?? [];
  const setRequests = ctx.setRequests ?? (() => {});
  const openCheckIn = ctx.openCheckIn ?? (() => {});
  const openCheckout = ctx.openCheckout ?? (() => {});

  // --- Server stats ---
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Local UI ---
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("arrivals");
  const [guestDetailsModal, setGuestDetailsModal] = useState({
    open: false,
    booking: null,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        // const res = await adminDashboard(token);
        // if (!cancelled) setData(res);
      } catch (err) {
        if (!cancelled) setError(err);
        console.error("receptionist dashboard fetch failed", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  // --- Derived ---
  const arrivalsCount = useMemo(
    () => bookings.filter((b) => b.status === "Confirmed").length,
    [bookings]
  );
  const departuresCount = useMemo(
    () => bookings.filter((b) => b.status === "Checked-In").length,
    [bookings]
  );

  const occupiedRooms = data?.occupiedRooms ?? departuresCount;
  const availableRooms = data?.availableRooms ?? 0;
  const totalRooms = data?.totalRooms ?? roomCount;
  const totalGuests = data?.totalCustomers ?? guestCount;

  const primaryStats = [
    { title: "Today's Arrivals", value: arrivalsCount },
    { title: "Today's Departures", value: departuresCount },
    { title: "Occupied Rooms", value: occupiedRooms },
    { title: "Available Rooms", value: availableRooms },
  ];

  const secondaryStats = [
    { title: "Total Rooms", value: totalRooms },
    { title: "Total Guests", value: totalGuests },
    { title: "Pending Requests", value: requests.length },
    { title: "Today's Revenue", value: formatINR(data?.todayRevenue ?? 0) },
  ];

  const occupancyPct =
    totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  const gaugeStyle = {
    background: `conic-gradient(#D96B43 0% ${occupancyPct}%, #f1f5f9 ${occupancyPct}% 100%)`,
  };

  const filteredBookings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const statusFilter = STATUS_FILTER[activeTab];

    return bookings.filter((b) => {
      if (statusFilter && b.status !== statusFilter) return false;
      if (!q) return true;

      const haystack = [b.guest, b.room, b.id]
        .map((v) => (v == null ? "" : String(v).toLowerCase()))
        .join(" ");
      return haystack.includes(q);
    });
  }, [bookings, activeTab, searchQuery]);

  // --- Early states ---
  if (loading) {
    return <div className="p-6 text-slate-500">Loading dashboard…</div>;
  }
  if (error) {
    return <div className="p-6 text-red-600">Failed to load dashboard.</div>;
  }

  return (
    <div className="space-y-6">
      {/* 1. KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {primaryStats.map((s) => (
          <StatCard key={s.title} {...s} />
        ))}
      </div>

      {/* 2. Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-800">
              Today's Front Desk Activity
            </h3>
            <select className="text-xs border border-slate-200 rounded-md px-2 py-1 text-slate-600 focus:outline-none">
              <option>This Week</option>
              <option>This Month</option>
            </select>
          </div>
          <div className="h-48 bg-slate-50 rounded-lg border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-sm">
            [ Bar Chart: Check-ins / Check-outs / Requests ]
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
            <div>
              <p className="text-slate-500">Arrivals</p>
              <p className="font-semibold text-slate-800">{arrivalsCount}</p>
            </div>
            <div>
              <p className="text-slate-500">Departures</p>
              <p className="font-semibold text-slate-800">{departuresCount}</p>
            </div>
            <div>
              <p className="text-slate-500">Open Requests</p>
              <p className="font-semibold text-slate-800">{requests.length}</p>
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
          </div>
        </div>
      </div>

      {/* 3. Secondary KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {secondaryStats.map((s) => (
          <StatCard key={s.title} {...s} />
        ))}
      </div>

      {/* 4. Table / Requests */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-base font-bold text-slate-800">
            {activeTab === "requests"
              ? "Guest Requests"
              : "Recent Guest Bookings"}
          </h3>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Search guests, rooms, IDs…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-[#D96B43]"
              />
            </div>
            <div className="flex gap-1 border border-slate-200 rounded-lg p-1 bg-slate-50">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1 text-[11px] font-medium rounded-md transition-all ${
                    activeTab === tab.id
                      ? "bg-white text-[#D96B43] shadow-sm font-semibold"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {activeTab === "requests" ? (
          <div className="p-5">
            {requests.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-6">
                No pending guest requests 🎉
              </p>
            ) : (
              <div className="grid gap-3">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 bg-slate-50 border border-slate-100 rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-bold">
                        Room {req.room}
                      </span>
                      <p className="text-xs font-semibold text-slate-900 mt-1">
                        {req.guest}
                      </p>
                      <p className="text-xs text-slate-500">
                        {req.request} • {req.time}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setRequests((prev) =>
                          prev.filter((r) => r.id !== req.id)
                        )
                      }
                      className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-1 rounded hover:bg-emerald-100 font-medium"
                    >
                      Resolve
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Booking ID</th>
                  <th className="px-6 py-3">Guest Name</th>
                  <th className="px-6 py-3">Room</th>
                  <th className="px-6 py-3">Check-in</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-6 text-center text-slate-400 text-xs"
                    >
                      No bookings match this filter.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="px-6 py-3 font-bold text-slate-800">
                        {row.id}
                      </td>
                      <td className="px-6 py-3">
                        <button
                          type="button"
                          onClick={() =>
                            setGuestDetailsModal({ open: true, booking: row })
                          }
                          className="font-medium text-slate-700 hover:text-[#D96B43] text-left"
                        >
                          {row.guest}
                        </button>
                      </td>
                      <td className="px-6 py-3 text-slate-500">{row.room}</td>
                      <td className="px-6 py-3 text-slate-500">{row.date}</td>
                      <td className="px-6 py-3 font-medium text-slate-800">
                        {formatINR(row.amount)}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                            STATUS_STYLES[row.status] ?? DEFAULT_STATUS_STYLE
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right space-x-2">
                        {row.status === "Confirmed" && (
                          <button
                            type="button"
                            onClick={() => openCheckIn(row)}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] px-2.5 py-1 rounded font-medium"
                          >
                            Check-In
                          </button>
                        )}
                        {row.status === "Checked-In" && (
                          <button
                            type="button"
                            onClick={() => openCheckout(row)}
                            className="bg-amber-50 hover:bg-amber-100 text-amber-700 text-[11px] px-2.5 py-1 rounded font-medium"
                          >
                            Checkout
                          </button>
                        )}
                        {row.status === "Checked-Out" && (
                          <span className="text-[10px] text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Guest details modal */}
      {guestDetailsModal.open && guestDetailsModal.booking && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget)
              setGuestDetailsModal({ open: false, booking: null });
          }}
        >
          <div className="bg-white rounded-xl p-6 max-w-md w-full space-y-4 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-800">
              Guest Information
            </h3>
            <div className="space-y-2 text-xs">
              <p className="text-slate-500">
                Name:{" "}
                <span className="text-slate-900 font-semibold">
                  {guestDetailsModal.booking.guest}
                </span>
              </p>
              <p className="text-slate-500">
                Email:{" "}
                <span className="text-slate-900 font-semibold">
                  {guestDetailsModal.booking.email}
                </span>
              </p>
              <p className="text-slate-500">
                Phone:{" "}
                <span className="text-slate-900 font-semibold">
                  {guestDetailsModal.booking.phone}
                </span>
              </p>
              <p className="text-slate-500">
                Room:{" "}
                <span className="text-slate-900 font-semibold">
                  {guestDetailsModal.booking.room}
                </span>
              </p>
              <p className="text-slate-500">
                Status:{" "}
                <span className="text-slate-900 font-semibold">
                  {guestDetailsModal.booking.status}
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setGuestDetailsModal({ open: false, booking: null })
              }
              className="w-full bg-slate-100 text-slate-700 py-2 rounded-lg text-xs font-medium hover:bg-slate-200 mt-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}