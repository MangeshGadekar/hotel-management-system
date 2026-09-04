import React, { useState } from "react";

// Inline SVGs (Zero external package dependencies)
const IconDashboard = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const IconUsers = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const IconBookings = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const IconCheckIn = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
  </svg>
);

const IconCheckOut = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const IconRequests = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 01-6 0v-1m6 0H9" />
  </svg>
);

const IconLogout = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const IconSearch = () => (
  <svg className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

export default function ReceptionistLayout() {
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  const [showRegisterGuest, setShowRegisterGuest] = useState(false);
  const [showCreateBooking, setShowCreateBooking] = useState(false);
  const [otpModal, setOtpModal] = useState({ open: false, booking: null });
  const [checkoutModal, setCheckoutModal] = useState({ open: false, booking: null });
  const [otpInput, setOtpInput] = useState("");

  const navItems = [
    { name: "Dashboard", icon: IconDashboard },
    { name: "Guest Management", icon: IconUsers },
    { name: "Booking Management", icon: IconBookings },
    { name: "Check-In Operations", icon: IconCheckIn },
    { name: "Check-Out Operations", icon: IconCheckOut },
    { name: "Guest Requests", icon: IconRequests, badge: 2 },
  ];

  const stats = [
    { id: "arrivals", label: "TODAY'S ARRIVALS", count: 8, change: "+12% vs last week" },
    { id: "departures", label: "TODAY'S DEPARTURES", count: 5, change: "+8% vs last week" },
    { id: "checked_in", label: "OCCUPIED ROOMS", count: 18, change: "+9% vs last week" },
    { id: "available_rooms", label: "AVAILABLE ROOMS", count: 12, change: "-4% vs last week" },
  ];

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
    <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between py-5 px-4 shadow-xs">
        <div>
          {/* Logo Box */}
          <div className="px-3 pb-6 flex items-center gap-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-xs shadow-xs">
              P
            </div>
            <span className="font-bold text-slate-800 text-sm tracking-wider uppercase">PARADISE</span>
          </div>

          <nav className="mt-6 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => setActiveMenu(item.name)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      isActive ? "bg-white text-emerald-600" : "bg-emerald-600 text-white"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <button className="w-full flex items-center gap-3 px-3.5 py-2 text-sm font-medium text-slate-500 hover:text-rose-600 transition-colors">
            <IconLogout />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-xs">
          <div>
            <h1 className="text-xl font-bold text-slate-800">{activeMenu}</h1>
            <p className="text-xs text-slate-500">Receptionist Front Desk Control Panel</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowRegisterGuest(true)}
              className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
            >
              + Register Guest
            </button>
            <button
              onClick={() => setShowCreateBooking(true)}
              className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-xs"
            >
              + Create Booking
            </button>
          </div>
        </header>

        {/* Canvas Area */}
        <main className="flex-1 overflow-y-auto p-8 space-y-6">
          {activeMenu === "Dashboard" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {stats.map((item) => (
                <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">{item.label}</p>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                      {item.change}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-slate-800 mt-3">{item.count}</p>
                </div>
              ))}
            </div>
          )}

          {activeMenu === "Guest Requests" ? (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-slate-800">Active Front Desk Requests</h2>
              <div className="grid gap-3">
                {requests.map((r) => (
                  <div key={r.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center">
                    <div>
                      <span className="text-xs px-2 py-0.5 rounded font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        Room {r.room}
                      </span>
                      <p className="text-sm font-semibold text-slate-800 mt-1">{r.guest}</p>
                      <p className="text-xs text-slate-500">{r.request} • <span className="text-slate-400">{r.time}</span></p>
                    </div>
                    <button 
                      onClick={() => setRequests(prev => prev.filter(req => req.id !== r.id))}
                      className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-md font-medium hover:bg-emerald-700 transition-colors"
                    >
                      Complete Request
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
              <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                <h2 className="text-base font-bold text-slate-800">Recent Bookings</h2>
                <div className="relative w-64">
                  <IconSearch />
                  <input
                    type="text"
                    placeholder="Search bookings or guests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs tracking-wider uppercase">
                      <th className="py-3 px-6">BOOKING ID</th>
                      <th className="py-3 px-6">GUEST NAME</th>
                      <th className="py-3 px-6">ROOM</th>
                      <th className="py-3 px-6">DATE</th>
                      <th className="py-3 px-6">AMOUNT</th>
                      <th className="py-3 px-6">STATUS</th>
                      <th className="py-3 px-6 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bookings.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-6 font-bold text-slate-800">{row.id}</td>
                        <td className="py-4 px-6 text-slate-700 font-medium">{row.guest}</td>
                        <td className="py-4 px-6 text-slate-500">{row.room}</td>
                        <td className="py-4 px-6 text-slate-500">{row.date}</td>
                        <td className="py-4 px-6 font-medium text-slate-800">{row.amount}</td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            row.status === "Confirmed"
                              ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                              : row.status === "Checked-In"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right space-x-2">
                          {row.status === "Confirmed" && (
                            <button
                              onClick={() => setOtpModal({ open: true, booking: row })}
                              className="px-3 py-1 bg-emerald-600 text-white rounded-md text-xs font-medium hover:bg-emerald-700 transition-colors"
                            >
                              Send OTP & Check-In
                            </button>
                          )}
                          {row.status === "Checked-In" && (
                            <button
                              onClick={() => setCheckoutModal({ open: true, booking: row })}
                              className="px-3 py-1 border border-slate-200 text-slate-700 rounded-md text-xs font-medium hover:bg-slate-50 transition-colors"
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
      </div>

      {/* Modals */}
      {showRegisterGuest && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full space-y-4 shadow-lg border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800">Register New Guest</h3>
            <form onSubmit={(e) => { e.preventDefault(); setShowRegisterGuest(false); }} className="space-y-3">
              <input type="text" placeholder="Full Name" required className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600" />
              <input type="email" placeholder="Email Address" required className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600" />
              <input type="tel" placeholder="Phone Number" required className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600" />
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowRegisterGuest(false)} className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">Save Guest</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCreateBooking && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full space-y-4 shadow-lg border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800">Create Booking</h3>
            <form onSubmit={(e) => { e.preventDefault(); setShowCreateBooking(false); }} className="space-y-3">
              <input type="text" placeholder="Guest Name" required className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600" />
              <select className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-600">
                <option>204 - Deluxe Room (₹11,200)</option>
                <option>101 - Suite (₹6,500)</option>
                <option>305 - Standard Room (₹9,000)</option>
              </select>
              <input type="date" required className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600" />
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowCreateBooking(false)} className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">Confirm Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {otpModal.open && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full space-y-4 shadow-lg border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800">Check-In OTP Verification</h3>
            <p className="text-xs text-slate-500">OTP sent to <span className="font-semibold text-emerald-600">{otpModal.booking?.email}</span></p>
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <input
                type="text"
                maxLength="6"
                placeholder="Enter 6-digit OTP"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                required
                className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-center text-lg tracking-widest text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
              <div className="flex gap-2">
                <button type="button" onClick={() => setOtpModal({ open: false, booking: null })} className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">Verify & Check-In</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {checkoutModal.open && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full space-y-4 shadow-lg border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800">Process Checkout</h3>
            <div className="bg-slate-50 p-3 rounded-lg space-y-2 text-xs border border-slate-200">
              <div className="flex justify-between text-slate-500"><span>Guest:</span> <span className="text-slate-800 font-medium">{checkoutModal.booking?.guest}</span></div>
              <div className="flex justify-between text-slate-500"><span>Room:</span> <span className="text-slate-800 font-medium">{checkoutModal.booking?.room}</span></div>
              <div className="flex justify-between text-slate-500"><span>Total Bill:</span> <span className="font-bold text-emerald-600">{checkoutModal.booking?.amount}</span></div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setCheckoutModal({ open: false, booking: null })} className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">Cancel</button>
              <button onClick={handleCheckout} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">Complete Checkout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}