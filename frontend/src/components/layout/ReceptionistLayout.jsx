import React, { useState } from "react";

// Inline SVGs (Zero external package dependencies)
const IconDashboard = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const IconUsers = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const IconBookings = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const IconCheckIn = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
  </svg>
);

const IconCheckOut = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const IconRequests = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 01-6 0v-1m6 0H9" />
  </svg>
);

const IconLogout = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const IconSearch = () => (
  <svg className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const ReceptionistLayout = () => {
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [showRegisterGuest, setShowRegisterGuest] = useState(false);
  const [showCreateBooking, setShowCreateBooking] = useState(false);
  const [otpModal, setOtpModal] = useState({ open: false, booking: null });
  const [checkoutModal, setCheckoutModal] = useState({ open: false, booking: null });
  const [otpInput, setOtpInput] = useState("");

  // Sidebar Menu Items
  const navItems = [
    { name: "Dashboard", icon: IconDashboard },
    { name: "Guest Management", icon: IconUsers },
    { name: "Booking Management", icon: IconBookings },
    { name: "Check-In Operations", icon: IconCheckIn },
    { name: "Check-Out Operations", icon: IconCheckOut },
    { name: "Guest Requests", icon: IconRequests, badge: 2 },
  ];

  // Overview Cards Stats Data
  const stats = [
    { id: "arrivals", label: "TODAY'S ARRIVALS", count: 8, change: "+12% vs last week" },
    { id: "departures", label: "TODAY'S DEPARTURES", count: 5, change: "+8% vs last week" },
    { id: "checked_in", label: "OCCUPIED ROOMS", count: 18, change: "+9% vs last week" },
    { id: "available_rooms", label: "AVAILABLE ROOMS", count: 12, change: "-4% vs last week" },
  ];

  // Bookings Data
  const [bookings, setBookings] = useState([
    { id: "HM10254", guest: "Rahul Sharma", email: "rahul@example.com", phone: "+91 98765 43210", room: "204 - Deluxe", date: "12 May", status: "Confirmed", amount: "₹11,200" },
    { id: "HM10253", guest: "Neha Verma", email: "neha@example.com", phone: "+91 98765 43211", room: "101 - Suite", date: "12 May", status: "Confirmed", amount: "₹6,500" },
    { id: "HM10252", guest: "Amit Patel", email: "amit@example.com", phone: "+91 98765 43212", room: "305 - Standard", date: "11 May", status: "Checked-In", amount: "₹9,000" },
    { id: "HM10251", guest: "Priya Singh", email: "priya@example.com", phone: "+91 98765 43213", room: "102 - Deluxe", date: "11 May", status: "Checked-Out", amount: "₹4,500" },
  ]);

  const [requests, setRequests] = useState([
    { id: 1, room: "101", guest: "Neha Verma", request: "Extra Towels & Pillows", time: "10 mins ago" },
    { id: 2, room: "204", guest: "Rahul Sharma", request: "Late Checkout Request", time: "25 mins ago" },
  ]);

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setBookings(prev => prev.map(b => b.id === otpModal.booking.id ? { ...b, status: "Checked-In" } : b));
    setOtpModal({ open: false, booking: null });
    setOtpInput("");
  };

  const handleCheckout = (e) => {
    e.preventDefault();
    setBookings(prev => prev.map(b => b.id === checkoutModal.booking.id ? { ...b, status: "Checked-Out" } : b));
    setCheckoutModal({ open: false, booking: null });
  };

  return (
    <div className="flex h-screen bg-[#FAF9F6] text-gray-800 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#FFFDF9] border-r border-gray-200/70 flex flex-col justify-between">
        <div>
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <div className="w-7 h-7 bg-[#F59E0B] rounded-lg flex items-center justify-center text-white font-bold text-xs">
              P
            </div>
            <span className="font-bold text-sm tracking-wide text-gray-900">PARADISE</span>
          </div>

          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => setActiveMenu(item.name)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-[#FEF3C7] text-[#D97706] font-semibold border-r-4 border-[#F59E0B]"
                      : "text-gray-600 hover:bg-gray-100/70 hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-[#F59E0B] text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-100">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-xs text-gray-500 hover:text-rose-600 transition-colors">
            <IconLogout />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8 space-y-6">
        {/* Top Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{activeMenu}</h1>
            <p className="text-xs text-gray-500 mt-0.5">Receptionist Front Desk Control Panel</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowRegisterGuest(true)}
              className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-xs font-medium hover:bg-gray-50 shadow-sm transition-colors"
            >
              + Register Guest
            </button>
            <button
              onClick={() => setShowCreateBooking(true)}
              className="bg-[#F59E0B] text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-amber-600 shadow-sm transition-colors"
            >
              + Create Booking
            </button>
          </div>
        </div>

        {/* Overview Stats Cards Dashboard Row */}
        {activeMenu === "Dashboard" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((item) => (
              <div key={item.id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-start">
                  <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">{item.label}</p>
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                    {item.change}
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">{item.count}</p>
              </div>
            ))}
          </div>
        )}

        {/* Operational View Switcher */}
        {activeMenu === "Guest Requests" ? (
          <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-gray-900">Active Front Desk Requests</h2>
            <div className="grid gap-3">
              {requests.map((r) => (
                <div key={r.id} className="p-4 bg-gray-50 border border-gray-100 rounded-lg flex justify-between items-center">
                  <div>
                    <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-bold">Room {r.room}</span>
                    <p className="text-xs font-semibold text-gray-900 mt-1">{r.guest}</p>
                    <p className="text-xs text-gray-500">{r.request} • <span className="text-gray-400">{r.time}</span></p>
                  </div>
                  <button 
                    onClick={() => setRequests(prev => prev.filter(req => req.id !== r.id))}
                    className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-1 rounded hover:bg-emerald-100 font-medium"
                  >
                    Complete Request
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold text-gray-900">Recent Bookings</h2>
              <div className="relative w-64">
                <IconSearch />
                <input
                  type="text"
                  placeholder="Search bookings or guests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-[#F59E0B]"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-semibold text-[10px] tracking-wider uppercase">
                    <th className="py-3 px-4">BOOKING ID</th>
                    <th className="py-3 px-4">GUEST NAME</th>
                    <th className="py-3 px-4">ROOM</th>
                    <th className="py-3 px-4">DATE</th>
                    <th className="py-3 px-4">AMOUNT</th>
                    <th className="py-3 px-4">STATUS</th>
                    <th className="py-3 px-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {bookings.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50/60">
                      <td className="py-3.5 px-4 font-bold text-gray-900">{row.id}</td>
                      <td className="py-3.5 px-4 font-medium text-gray-700">{row.guest}</td>
                      <td className="py-3.5 px-4 text-gray-500">{row.room}</td>
                      <td className="py-3.5 px-4 text-gray-500">{row.date}</td>
                      <td className="py-3.5 px-4 font-medium text-gray-900">{row.amount}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                          row.status === "Checked-In" ? "bg-blue-50 text-blue-600" :
                          row.status === "Checked-Out" ? "bg-gray-100 text-gray-500" :
                          "bg-emerald-50 text-emerald-600"
                        }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {row.status === "Confirmed" && (
                          <button
                            onClick={() => setOtpModal({ open: true, booking: row })}
                            className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded font-medium hover:bg-emerald-100 text-[11px]"
                          >
                            Send OTP & Check-In
                          </button>
                        )}
                        {row.status === "Checked-In" && (
                          <button
                            onClick={() => setCheckoutModal({ open: true, booking: row })}
                            className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded font-medium hover:bg-amber-100 text-[11px]"
                          >
                            Checkout
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modal: Register Guest */}
      {showRegisterGuest && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-gray-900">Register New Guest</h3>
            <form onSubmit={(e) => { e.preventDefault(); setShowRegisterGuest(false); }} className="space-y-3">
              <input type="text" placeholder="Full Name" required className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs focus:border-[#F59E0B] focus:outline-none" />
              <input type="email" placeholder="Email Address" required className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs focus:border-[#F59E0B] focus:outline-none" />
              <input type="tel" placeholder="Phone Number" required className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs focus:border-[#F59E0B] focus:outline-none" />
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowRegisterGuest(false)} className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-xs font-medium">Cancel</button>
                <button type="submit" className="flex-1 bg-[#F59E0B] text-white py-2 rounded-lg text-xs font-semibold">Save Guest</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Booking */}
      {showCreateBooking && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-gray-900">Create Booking</h3>
            <form onSubmit={(e) => { e.preventDefault(); setShowCreateBooking(false); }} className="space-y-3">
              <input type="text" placeholder="Guest Name" required className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs focus:border-[#F59E0B] focus:outline-none" />
              <select className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs text-gray-700 focus:border-[#F59E0B] focus:outline-none">
                <option>204 - Deluxe Room (₹11,200)</option>
                <option>101 - Suite (₹6,500)</option>
                <option>305 - Standard Room (₹9,000)</option>
              </select>
              <input type="date" required className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs focus:border-[#F59E0B] focus:outline-none" />
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowCreateBooking(false)} className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-xs font-medium">Cancel</button>
                <button type="submit" className="flex-1 bg-[#F59E0B] text-white py-2 rounded-lg text-xs font-semibold">Confirm Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Check-In OTP Verification */}
      {otpModal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-gray-900">Check-In OTP Verification</h3>
            <p className="text-xs text-gray-500">OTP sent to <span className="text-[#F59E0B] font-semibold">{otpModal.booking?.email}</span></p>
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <input
                type="text"
                maxLength="6"
                placeholder="Enter 6-digit OTP"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-center text-lg tracking-widest text-gray-900 focus:outline-none focus:border-[#F59E0B]"
              />
              <div className="flex gap-2">
                <button type="button" onClick={() => setOtpModal({ open: false, booking: null })} className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-xs font-medium">Cancel</button>
                <button type="submit" className="flex-1 bg-[#F59E0B] text-white py-2 rounded-lg text-xs font-semibold">Verify & Check-In</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Checkout */}
      {checkoutModal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-gray-900">Process Checkout</h3>
            <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-xs border border-gray-100">
              <div className="flex justify-between text-gray-500"><span>Guest:</span> <span className="text-gray-900 font-medium">{checkoutModal.booking?.guest}</span></div>
              <div className="flex justify-between text-gray-500"><span>Room:</span> <span className="text-gray-900 font-medium">{checkoutModal.booking?.room}</span></div>
              <div className="flex justify-between text-gray-500"><span>Total Bill:</span> <span className="text-[#F59E0B] font-bold">{checkoutModal.booking?.amount}</span></div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setCheckoutModal({ open: false, booking: null })} className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-xs font-medium">Cancel</button>
              <button onClick={handleCheckout} className="flex-1 bg-amber-600 text-white py-2 rounded-lg text-xs font-semibold">Complete Checkout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionistLayout;