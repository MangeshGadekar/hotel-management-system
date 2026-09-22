import React, { useState } from "react";

// Inline SVGs (No external package dependencies)
const IconLogIn = () => (
  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
  </svg>
);

const IconLogOut = () => (
  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const IconKey = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
  </svg>
);

const IconBed = () => (
  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const IconSearch = () => (
  <svg className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("arrivals");
  
  // Modals state
  const [showCreateBooking, setShowCreateBooking] = useState(false);
  const [otpModal, setOtpModal] = useState({ open: false, booking: null });
  const [checkoutModal, setCheckoutModal] = useState({ open: false, booking: null });
  const [guestDetailsModal, setGuestDetailsModal] = useState({ open: false, guest: null });
  const [otpInput, setOtpInput] = useState("");

  const stats = [
    { id: "arrivals", label: "TODAY'S ARRIVALS", count: 8, Icon: IconLogIn, change: "+12% vs last week" },
    { id: "departures", label: "TODAY'S DEPARTURES", count: 5, Icon: IconLogOut, change: "+8% vs last week" },
    { id: "checked_in", label: "OCCUPIED ROOMS", count: 18, Icon: () => <IconKey className="w-5 h-5 text-emerald-600" />, change: "+9% vs last week" },
    { id: "available_rooms", label: "AVAILABLE ROOMS", count: 12, Icon: IconBed, change: "-4% vs last week" },
  ];

  const [bookings, setBookings] = useState([
    { 
      id: "HM10254", 
      guest: {
        firstName: "Rahul",
        lastName: "Sharma",
        email: "rahul@example.com",
        phone: "+91 98765 43210",
        idProofType: "AADHAAR",
        idProofNumber: "ABCD1234EF",
        address: "123 MG Road",
        city: "Pune",
        state: "Maharashtra",
        postalCode: "411001",
      },
      room: "204 - Deluxe", 
      date: "12 May 2026", 
      status: "Confirmed", 
      amount: "₹11,200" 
    },
    { 
      id: "HM10253", 
      guest: {
        firstName: "Neha",
        lastName: "Verma",
        email: "neha@example.com",
        phone: "+91 98765 43211",
        idProofType: "PASSPORT",
        idProofNumber: "Z9876543",
        address: "45 Park Street",
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "400001",
      },
      room: "101 - Suite", 
      date: "12 May 2026", 
      status: "Confirmed", 
      amount: "₹6,500" 
    },
    { 
      id: "HM10252", 
      guest: {
        firstName: "Amit",
        lastName: "Patel",
        email: "amit@example.com",
        phone: "+91 98765 43212",
        idProofType: "DRIVING_LICENSE",
        idProofNumber: "DL1420110012345",
        address: "88 Ring Road",
        city: "Ahmedabad",
        state: "Gujarat",
        postalCode: "380001",
      },
      room: "305 - Standard", 
      date: "11 May 2026", 
      status: "Checked-In", 
      amount: "₹9,000" 
    },
    { 
      id: "HM10251", 
      guest: {
        firstName: "Priya",
        lastName: "Singh",
        email: "priya@example.com",
        phone: "+91 98765 43213",
        idProofType: "PAN_CARD",
        idProofNumber: "ABCDE1234F",
        address: "12 Civil Lines",
        city: "Delhi",
        state: "Delhi",
        postalCode: "110054",
      },
      room: "102 - Deluxe", 
      date: "11 May 2026", 
      status: "Checked-Out", 
      amount: "₹4,500" 
    },
  ]);

  const [guestRequests, setGuestRequests] = useState([
    { id: 1, room: "101", guest: "Neha Verma", request: "Extra Towels & Pillows", status: "Pending" },
    { id: 2, room: "204", guest: "Rahul Sharma", request: "Late Checkout Inquiry", status: "In Progress" },
  ]);

  const triggerCheckInOtp = (booking) => {
    setOtpModal({ open: true, booking });
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setBookings(prev => prev.map(b => b.id === otpModal.booking.id ? { ...b, status: "Checked-In" } : b));
    setOtpModal({ open: false, booking: null });
    setOtpInput("");
  };

  const handleProcessCheckout = (e) => {
    e.preventDefault();
    setBookings(prev => prev.map(b => b.id === checkoutModal.booking.id ? { ...b, status: "Checked-Out" } : b));
    setCheckoutModal({ open: false, booking: null });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 bg-[#F8FAFC] text-slate-800 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">Receptionist Front Desk & Operational Controls</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowCreateBooking(true)}
            className="px-3.5 py-2 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition-colors shadow-xs flex items-center gap-2"
          >
            <IconKey className="w-4 h-4 text-white" /> Create Booking
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <div 
              key={item.id} 
              onClick={() => setActiveTab(item.id)}
              className={`cursor-pointer bg-white border rounded-xl p-5 shadow-xs transition-all ${
                isActive ? "border-emerald-600 ring-1 ring-emerald-600" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex justify-between items-start">
                <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">{item.label}</p>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                  {item.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-800 mt-2">{item.count}</p>
            </div>
          );
        })}
      </div>

      {/* Table Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-base font-bold text-slate-800">Recent Guest Bookings</h2>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <IconSearch />
              <input 
                type="text" 
                placeholder="Search guests or rooms..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>
            <div className="flex gap-1 border border-slate-200 rounded-lg p-1 bg-slate-50">
              {["arrivals", "departures", "checked_in", "requests"].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 text-[11px] font-medium rounded-md capitalize transition-all ${
                    activeTab === tab 
                      ? "bg-white text-emerald-700 shadow-xs font-semibold" 
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {tab.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
        </div>

        {activeTab === "requests" ? (
          <div className="space-y-3 pt-2">
            <div className="grid gap-3">
              {guestRequests.map((req) => (
                <div key={req.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center">
                  <div>
                    <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200/60 px-2 py-0.5 rounded font-bold">Room {req.room}</span>
                    <p className="text-xs font-semibold text-slate-800 mt-1">{req.guest}</p>
                    <p className="text-xs text-slate-500">{req.request}</p>
                  </div>
                  <button 
                    onClick={() => setGuestRequests(prev => prev.filter(r => r.id !== req.id))}
                    className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-md hover:bg-emerald-700 transition-colors font-medium"
                  >
                    Resolve Request
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">BOOKING ID</th>
                  <th className="py-3 px-4">GUEST NAME</th>
                  <th className="py-3 px-4">ROOM</th>
                  <th className="py-3 px-4">CHECK-IN</th>
                  <th className="py-3 px-4">AMOUNT</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-800">{row.id}</td>
                    <td className="py-3.5 px-4">
                      <button 
                        onClick={() => setGuestDetailsModal({ open: true, guest: row.guest })}
                        className="font-medium text-slate-700 hover:text-emerald-700 text-left underline-offset-2 hover:underline"
                      >
                        {row.guest.firstName} {row.guest.lastName}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{row.room}</td>
                    <td className="py-3.5 px-4 text-slate-500">{row.date}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{row.amount}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${
                        row.status === "Checked-In" 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200/60" 
                          : row.status === "Checked-Out"
                          ? "bg-slate-100 text-slate-600 border-slate-200"
                          : "bg-amber-50 text-amber-700 border-amber-200/60"
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {row.status === "Confirmed" && (
                        <button 
                          onClick={() => triggerCheckInOtp(row)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] px-2.5 py-1 rounded-md font-medium transition-colors"
                        >
                          Send OTP & Check-In
                        </button>
                      )}
                      {row.status === "Checked-In" && (
                        <button 
                          onClick={() => setCheckoutModal({ open: true, booking: row })}
                          className="border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11px] px-2.5 py-1 rounded-md font-medium transition-colors"
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
        )}
      </div>

      {/* Modal: Create Booking */}
      {showCreateBooking && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-md w-full space-y-4 shadow-lg">
            <h3 className="text-base font-bold text-slate-800">Create Guest Booking</h3>
            <form onSubmit={(e) => { e.preventDefault(); setShowCreateBooking(false); }} className="space-y-3">
              <input type="text" placeholder="Guest Name" required className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600" />
              <select className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-600">
                <option>204 - Deluxe Room (₹11,200)</option>
                <option>101 - Suite (₹6,500)</option>
                <option>305 - Standard Room (₹9,000)</option>
              </select>
              <input type="date" required className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600" />
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowCreateBooking(false)} className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-xs font-medium hover:bg-emerald-700 transition-colors">Create Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Verify OTP */}
      {otpModal.open && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-sm w-full space-y-4 shadow-lg">
            <h3 className="text-base font-bold text-slate-800">Verify Check-In OTP</h3>
            <p className="text-xs text-slate-500">
              An OTP was sent to <span className="text-emerald-700 font-semibold">{otpModal.booking?.guest?.email}</span>. Ask guest to provide code.
            </p>
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <input 
                type="text" 
                maxLength="6"
                placeholder="Enter OTP" 
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                required
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-center text-lg tracking-widest text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={() => setOtpModal({ open: false, booking: null })}
                  className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-xs font-medium hover:bg-emerald-700 transition-colors"
                >
                  Verify & Check-In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Checkout */}
      {checkoutModal.open && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-sm w-full space-y-4 shadow-lg">
            <h3 className="text-base font-bold text-slate-800">Process Checkout</h3>
            <div className="bg-slate-50 p-3 rounded-lg space-y-2 text-xs border border-slate-200">
              <div className="flex justify-between text-slate-500"><span>Guest:</span> <span className="text-slate-800 font-medium">{checkoutModal.booking?.guest?.firstName} {checkoutModal.booking?.guest?.lastName}</span></div>
              <div className="flex justify-between text-slate-500"><span>Room:</span> <span className="text-slate-800 font-medium">{checkoutModal.booking?.room}</span></div>
              <div className="flex justify-between text-slate-500"><span>Final Bill:</span> <span className="text-emerald-700 font-bold">{checkoutModal.booking?.amount}</span></div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setCheckoutModal({ open: false, booking: null })}
                className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleProcessCheckout}
                className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-xs font-medium hover:bg-emerald-700 transition-colors"
              >
                Confirm Checkout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Extended Guest Details */}
      {guestDetailsModal.open && guestDetailsModal.guest && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-md w-full space-y-4 shadow-lg">
            <h3 className="text-base font-bold text-slate-800">Guest Information</h3>
            <div className="space-y-2 text-xs divide-y divide-slate-100">
              <div className="pb-2">
                <p className="text-slate-400 font-medium uppercase text-[10px]">Full Name</p>
                <p className="text-slate-800 font-semibold text-sm">{guestDetailsModal.guest.firstName} {guestDetailsModal.guest.lastName}</p>
              </div>
              <div className="py-2 grid grid-cols-2 gap-2">
                <div>
                  <p className="text-slate-400 font-medium uppercase text-[10px]">Email</p>
                  <p className="text-slate-800 font-medium">{guestDetailsModal.guest.email}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium uppercase text-[10px]">Phone</p>
                  <p className="text-slate-800 font-medium">{guestDetailsModal.guest.phone}</p>
                </div>
              </div>
              <div className="py-2 grid grid-cols-2 gap-2">
                <div>
                  <p className="text-slate-400 font-medium uppercase text-[10px]">ID Type</p>
                  <p className="text-slate-800 font-medium">{guestDetailsModal.guest.idProofType}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium uppercase text-[10px]">ID Number</p>
                  <p className="text-slate-800 font-medium">{guestDetailsModal.guest.idProofNumber}</p>
                </div>
              </div>
              <div className="pt-2">
                <p className="text-slate-400 font-medium uppercase text-[10px]">Address</p>
                <p className="text-slate-800 font-medium">
                  {guestDetailsModal.guest.address}, {guestDetailsModal.guest.city}, {guestDetailsModal.guest.state} - {guestDetailsModal.guest.postalCode}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setGuestDetailsModal({ open: false, guest: null })}
              className="w-full bg-slate-100 text-slate-700 py-2 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors mt-2"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;