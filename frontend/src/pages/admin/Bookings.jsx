import { useState } from 'react';
import BookingForm from '../../components/forms/BookingForm';

const STATUS_BADGES = {
  Confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Checked-In': 'bg-blue-50 text-blue-700 border-blue-200',
  'Checked-Out': 'bg-slate-100 text-slate-700 border-slate-200',
  Cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
};

export default function Bookings() {
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);

  const [bookings, setBookings] = useState([
    { id: 'HM10254', guestName: 'Rahul Sharma', room: 'D101 (Deluxe)', checkIn: '2026-05-12', checkOut: '2026-05-14', amount: '₹11,200', status: 'Confirmed' },
    { id: 'HM10253', guestName: 'Neha Verma', room: 'E201 (Executive)', checkIn: '2026-05-12', checkOut: '2026-05-13', amount: '₹6,500', status: 'Confirmed' },
    { id: 'HM10252', guestName: 'Amit Patel', room: 'D102 (Deluxe)', checkIn: '2026-05-11', checkOut: '2026-05-13', amount: '₹9,000', status: 'Checked-In' },
    { id: 'HM10251', guestName: 'Priya Singh', room: 'S301 (Suite)', checkIn: '2026-05-11', checkOut: '2026-05-12', amount: '₹9,500', status: 'Checked-Out' },
    { id: 'HM10250', guestName: 'Karan Mehta', room: 'D103 (Deluxe)', checkIn: '2026-05-10', checkOut: '2026-05-12', amount: '₹9,000', status: 'Cancelled' },
  ]);

  const handleStatusChange = (bookingId, newStatus) => {
    setBookings(
      bookings.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
    );
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = filterStatus === 'All' || b.status === filterStatus;
    const matchesSearch =
      b.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Booking Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">Track, update, and manage all guest reservations</p>
        </div>

        {/* Search & Filter Controls */}

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowBookingForm(true)}
            className="px-4 py-2 bg-[#D96B43] text-white rounded-lg text-sm font-semibold"
          >
            Add Booking
          </button>
          <input
            type="text"
            placeholder="Search by ID or Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
          >
            <option value="All">All Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Checked-In">Checked-In</option>
            <option value="Checked-Out">Checked-Out</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Booking ID</th>
                <th className="px-6 py-3">Guest Name</th>
                <th className="px-6 py-3">Assigned Room</th>
                <th className="px-6 py-3">Check-In</th>
                <th className="px-6 py-3">Check-Out</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-6 py-4 font-semibold text-slate-900">{b.id}</td>
                  <td className="px-6 py-4 font-medium text-slate-800">{b.guestName}</td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-700">{b.room}</td>
                  <td className="px-6 py-4">{b.checkIn}</td>
                  <td className="px-6 py-4">{b.checkOut}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">{b.amount}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${STATUS_BADGES[b.status]}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <select
                      value={b.status}
                      onChange={(e) => handleStatusChange(b.id, e.target.value)}
                      className="text-xs border border-slate-200 rounded-md px-2 py-1 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#D96B43]"
                    >
                      <option value="Confirmed">Confirmed</option>
                      <option value="Checked-In">Checked-In</option>
                      <option value="Checked-Out">Checked-Out</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showBookingForm && (
  <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-800">
          Add Booking
        </h3>

        <button
          onClick={() => setShowBookingForm(false)}
          className="text-slate-500 hover:text-slate-800"
        >
          ✕
        </button>
      </div>

      <BookingForm />

    </div>
  </div>
)}
    </div>
  );
}